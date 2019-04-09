import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, renderLoader, clearLoader} from './views/base';
/**Global state of app
*-- Search object
*-- Current recipes object
*-- Shopping list object
*-- Liked recipes
*/
const state = {};
/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
    // 1) Get query from view
    const query = searchView.getInput();

    if (query) {
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

       try {
            // 4) Search for recipes
            await state.search.getResults();
            console.log(state.search.result);

            // 5) Render results on UI
            clearLoader();

            searchView.renderResults(state.search.result);
       } catch (err) {
            alert('Something wrong with the search...');
            clearLoader();
        }
    }
}



elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();

});


elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});


/**
 * RECIPE CONTROLLER
*/
const controlRecipe = async () => {
  const id = window.location.hash.replace('#','');


  if(id) {

    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight selected search item
    if (state.search) searchView.highlightSelected(id);

    state.recipe = new Recipe(id);

    try {
      //Get recipe data and parseIngredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      state.recipe.calcTime();
      state.recipe.calcServings();

      clearLoader();
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
      );
    } catch(error) {
      clearLoader();
      alert('Error processing recipe!');
    }
  }
};


['hashchange','load'].forEach(event => window.addEventListener(event, controlRecipe));
/**
 * LIST CONTROLLER
 */
const controlList = () => {
  if(!state.list) state.list = new List();

  state.recipe.ingredient.forEach(el => {
    const item = state.list.addItem(el.count,el.unit,el.ingredient);
    listView.renderItem(item);
  })
};

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

    // Handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

/**
 * LIKE CONTROLLER
 */
const controlLike = () => {
  if(!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;

  if(!state.likes.isLiked(currentID)) {

    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );

    likesView.toggleLikeBtn(true);

    likesView.renderLike(newLike);



  } else {
    state.likes.deleteLike(currentID);

    likesView.toggleLikeBtn(false);
    likesView.deleteLike(currentID);
  }

  likesView.toggleLikeMenu(state.likes.getNumLikes());

};

//Restored likes recipes
window.addEventListener('load', () => {
  state.likes = new Likes();
  state.likes.readStorage();
  likesView.toggleLikeMenu(state.likes.getNumLikes());

  state.likes.likes.forEach( like => likesView.renderLike(like));
});

//Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
  if(e.target.matches('.btn-decrease, .btn-decrease *')) {
    if(state.recipe.servings > 1){
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    controlList();
  } else if(e.target.matches('.recipe__love, .recipe__love *')) {
    controlLike();
  }
});
