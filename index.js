const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const MOVIES_PER_PAGE = 12
const movies = []
let filteredMovies = []
let currentPage = 1


const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input') 
const paginator = document.querySelector('#paginator')
const modeChangeSwitch = document.querySelector('#change-mode')

function renderMovieList(data) {
  if (dataPanel.dataset.mode === "card-mode") {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image, id
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
} else if (dataPanel.dataset.mode === 'list-mode') {
  let rawHTML = `<ul class="list-group col-sm-12 mb-2">`
  data.forEach((item) => {
    // title, image, id
    rawHTML += `
      <li class="list-group-item d-flex justify-content-between">
        <h5 class="card-title">${item.title}</h5>
        <div>
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"
            data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>
    `
  })
  rawHTML += `</ul>` 
  dataPanel.innerHTML = rawHTML
  }
}

function renderPaginator(amount) {
  //計算總頁數   ceil  無條件進位
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作 template 
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  //計算起始 index 
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

    axios.get(INDEX_URL + id).then(response => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
    })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function changeMode(switchMode) {
  if (dataPanel.dataset.mode === switchMode) return
  dataPanel.dataset.mode = switchMode
}

modeChangeSwitch.addEventListener('click', function onSwitchClicked(event) {
  if (event.target.matches('#card-mode-button')) {
    changeMode('card-mode')
    renderMovieList(getMoviesByPage(currentPage))
  } else if (event.target.matches('#list-mode-button')) {
    changeMode('list-mode')
    renderMovieList(getMoviesByPage(currentPage))
  }
})


dataPanel.addEventListener('click', function onPanelClicked(event){
  if (event.target.matches('.btn-show-movie')){
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
 //取消預設事件
  event.preventDefault()
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()
    //儲存符合篩選條件的項目
  //條件篩選
  filteredMovies = movies.filter((movie) => 
    movie.title.toLowerCase().includes(keyword)
  )
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  currentPage = 1
  //重新輸出至畫面
  renderPaginator(filteredMovies.length)
   //預設顯示第 1 頁的搜尋結果
  renderMovieList(getMoviesByPage(1))
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  currentPage = page
  //更新畫面
  renderMovieList(getMoviesByPage(page))
})

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(currentPage))
  })
  .catch((error) => {console.warn(error)
  })