import PixabayApi from './js/pixabay_api';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';

import 'simplelightbox/dist/simple-lightbox.min.css';

const pixabayApi = new PixabayApi();
const lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  captionsData: 'alt',
});

const refs = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadBtn: document.querySelector('.load-more'),
};

refs.searchForm.addEventListener('submit', onFormSubmit);
refs.loadBtn.addEventListener('click', handleImageLoading);

function onFormSubmit(e) {
  e.preventDefault();

  const currentQuery = e.currentTarget.elements.searchQuery.value
    .trim()
    .toLowerCase();

  if (currentQuery === '') {
    onSearchFailureNotify();
    return;
  }

  if (currentQuery !== pixabayApi.query) {
    refs.loadBtn.classList.add('is-hidden');
    pixabayApi.query = currentQuery;
  }

  pixabayApi.resetPage();
  refs.gallery.innerHTML = '';
  handleImageLoading();
}

async function handleImageLoading() {
  try {
    const data = await pixabayApi.getImages();

    if (data.totalHits === 0) {
      onSearchFailureNotify();
      return;
    }

    if (pixabayApi.page === 1) {
      onSuccessNotify(data);
      refs.loadBtn.classList.remove('is-hidden');
    }

    if (data.totalHits < pixabayApi.perPage * pixabayApi.page) {
      refs.loadBtn.classList.add('is-hidden');
      if (pixabayApi.page !== 1) {
        onReachedResultsEndNotify();
      }
    }

    pixabayApi.incrementPage();
    dataRender(data.hits);
    lightbox.refresh();
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
}

function onSuccessNotify(data) {
  Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
}

function onSearchFailureNotify() {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function onReachedResultsEndNotify() {
  Notiflix.Notify.failure(
    "We're sorry, but you've reached the end of search results."
  );
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
