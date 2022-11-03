import PixabayApi from './js/pixabay_api';
import throttle from 'lodash.throttle';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';

import 'simplelightbox/dist/simple-lightbox.min.css';

const pixabayApi = new PixabayApi();
const lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  captionsData: 'alt',
});
const onWindowScroll = throttle(handleScroll, 500);

const refs = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
};

refs.searchForm.addEventListener('submit', onFormSubmit);

function onFormSubmit(e) {
  e.preventDefault();

  if (e.currentTarget.elements.searchQuery.value === '') {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );

    pixabayApi.isOk = false;
    return;
  }

  if (pixabayApi.query !== e.currentTarget.elements.searchQuery.value) {
    pixabayApi.resetPage();
    refs.gallery.innerHTML = '';
    pixabayApi.query = e.currentTarget.elements.searchQuery.value;
    handleImageLoading().then(() => {
      if (pixabayApi.isOk) {
        Notiflix.Notify.success(
          `Hooray! We found ${pixabayApi.totalHits} images.`
        );
      }
    });
  } else {
    handleImageLoading();
  }
}

async function handleImageLoading() {
  try {
    const data = await pixabayApi.getImages();

    if (data.totalHits === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );

      pixabayApi.isOk = false;
      return;
    }

    if (data.hits.length === 0) {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );

      window.removeEventListener('scroll', onWindowScroll);

      pixabayApi.isOk = false;
      return;
    }

    pixabayApi.totalHits = data.totalHits;
    pixabayApi.isOk = true;
    pixabayApi.incrementPage();
    dataRender(data.hits);
    lightbox.refresh();
    window.addEventListener('scroll', onWindowScroll);
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
}

function dataRender(data) {
  const markup = data.map(createPhotoCardsMarkup).join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function createPhotoCardsMarkup({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `
  <div class="photo-card">
    <a href="${largeImageURL}">
      <img src="${webformatURL}" alt="${tags}" loading="lazy" width="330" height="220"/>
    </a>
    <div class="info">
      <p class="info-item">
        <b>Likes </b>
        ${likes}
      </p>
      <p class="info-item">
        <b>Views </b>
        ${views}
      </p>
      <p class="info-item">
        <b>Comments </b>
        ${comments}
      </p>
      <p class="info-item">
        <b>Downloads </b>
        ${downloads}
      </p>
    </div>
  </div>`;
}

function handleScroll() {
  const height = document.body.offsetHeight;
  const screenHeight = window.innerHeight;
  const scrolled = window.scrollY;
  const threshold = height - screenHeight / 4;
  const position = scrolled + screenHeight;

  if (position >= threshold) {
    if (pixabayApi.page === 1) {
      return;
    }

    handleImageLoading();
  }
}
