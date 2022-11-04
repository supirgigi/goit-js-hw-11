import axios from 'axios';

export default class PixabayApi {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.perPage = 40;
  }

  async getImages() {
    const URL = 'https://pixabay.com/api';
    const API_KEY = '31094402-9b49d62cc201a31f5dc4dc039';
    const url = `${URL}/?key=${API_KEY}&q=${this.searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${this.perPage}&page=${this.page}`;
    const { data } = await axios.get(url);
    return data;
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}
