import axios from 'axios';
import {key, proxy} from '../config';

export default class Search {

  constructor(query) {
    this.query = query;
  }
  async getResults() {
//   const proxy = 'https://cors-anywhere.herokuapp.com/';
  // const key = 'fc4bbfe15ad47031f58d8127523a94ab';

    try {
      const res = await axios(`${proxy}www.food2fork.com/api/search?key=${key}&q=${this.query}`);
      this.result = res.data.recipes;
    } catch(error) {
      alert(error);
    }

  }
}
