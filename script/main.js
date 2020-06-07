const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const API_KEY = 'fed3e3ee97140de029816fa573f12fbb';
const SERVER ='https://api.themoviedb.org/3';
//меню
const leftmenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const tvShowsList = document.querySelector('.tv-shows__list');
const modal = document.querySelector('.modal');
const tvShows = document.querySelector('.tv-shows');
const tvCardImg = document.querySelector('.tv-card__img');
const modalTitle = document.querySelector('.modal__title');
const genresList = document.querySelector('.genres-list');
const rating = document.querySelector('.rating');
const description = document.querySelector('.description');
const modalLink = document.querySelector('.modal__link');
const tvShowsHead = document.querySelector('.tv-shows__head');
const pagination = document.querySelector('.pagination');

const searchForm = document.querySelector('.search__form');
const searchFormInput = document.querySelector('.search__form-input');


const loading = document.createElement('div');
loading.className='loading';

//открытие на кнопку меню
hamburger.addEventListener('click', () => {
    event.preventDefault();
    leftmenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
});

//закрытие при клике не на меню
document.addEventListener('click',(event)=>{
    if (!event.target.closest('.left-menu')){ //ищет вверх по дум дереву элемент left-menu
        leftmenu.classList.remove('openMenu');
    }
});

//открытие при клике на конкретный пункт
leftmenu.addEventListener('click',(event)=>{
    event.preventDefault();
    const target = event.target;
    const dropdown = target.closest('.dropdown');
    if (dropdown){
        dropdown.classList.toggle('active');
        leftmenu.classList.add('openMenu');
        hamburger.classList.add('open');
    };

    if (target.closest('#top-rated')){
        dbService.getTopRated().then((response)=>rendercard(response,target));
    }
    if (target.closest('#popular')){
        dbService.getPopular().then((response)=>rendercard(response,target));
    }
    if (target.closest('#week')){
        dbService.getWeek().then((response)=>rendercard(response,target));
    }
    if (target.closest('#today')){
        dbService.getToday().then((response)=>rendercard(response,target));
    }
});

//открытие модального(всплывающего) окно
tvShowsList.addEventListener('click', event =>{
    event.preventDefault();
    const target = event.target;
    const card = target.closest('.tv-card');
    if (card){
        card.append(loading);
        dbService
            .getTvShow(card.id)
            .then(response =>{
                tvCardImg.src = response.poster_path ? IMG_URL + response.poster_path:'img/no-poster.jpg';
                modalTitle.textContent = response.name;
                //genresList.innerHTML = response.genres.reduce((acc,item)=>`${acc} <li>${item.name}</li>`,''); вариант с reduce
                genresList.innerHTML = '';
                for (const item of response.genres){
                    genresList.innerHTML += `<li>${item.name}</li>`;
                }
                rating.textContent = response.vote_average;
                description.textContent = response.overview;
                modalLink.href = response.homepage;
            })
            .then(()=>{
                loading.remove();
                document.body.style.overflow = 'hidden';
                modal.classList.remove('hide');   
            })
    }
});

//закрытие
modal.addEventListener('click',event =>{
    if ((event.target.closest('.cross'))||(event.target.classList.contains('modal'))){
        document.body.style.overflow = '';
        modal.classList.add('hide');
    };
});

class DBService{
    getData =  async (url) =>{
        const res = await fetch(url);
        if (res.ok){
            return res.json();
        } else{
            throw new Error(`Не удалось получить данные по адрессу ${url}`)
        }
    }

    getTestData = async () =>{
        return await this.getData('test.json');
    }

    getTestCard = async () =>{
        return await this.getData('card.json');
    }

    getSearchResult = (query) =>{
        this.temp = `${SERVER}/search/tv?api_key=${API_KEY}&language=ru-Ru&query=${query}`;
        return this.getData(this.temp);
    }

    getNextPage = page => {
        return this.getData(this.temp + '&page=' + page);
    }

    getTvShow = (id) =>{
        return this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`);
    }
    getTopRated = () =>{
        return this.getData(`${SERVER}/tv/top_rated?api_key=${API_KEY}&language=ru-RU`);
    }
    getToday = () =>{
        return this.getData(`${SERVER}/tv/airing_today?api_key=${API_KEY}&language=ru-RU`);
    }
    getWeek = () =>{
        return this.getData(`${SERVER}/tv/on_the_air?api_key=${API_KEY}&language=ru-RU`);
    }
    getPopular = () =>{
        return this.getData(`${SERVER}/tv/popular?api_key=${API_KEY}&language=ru-RU`);
    }
};

const dbService = new DBService();

const rendercard = (response,target) =>{
    tvShowsList.textContent = '';
    if (response.results.length){
    response.results.forEach(item =>{
        const {backdrop_path:backd,
            name:title,
            poster_path:poster,
            vote_average:vote,
            id
        } = item;
        tvShowsHead.textContent = target? target.textContent:'Результат поиска';
        const posterIMG = poster ? IMG_URL+poster:'img/no-poster.jpg';
        const backdropIMG = backd ? IMG_URL + backd:'';
        const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';
        
        const card = document.createElement('li');
        card.classList.add('tv-shows__item');
        card.innerHTML = `
        <a href="#" id="${id}" class="tv-card">
            ${voteElem}
            <img class="tv-card__img"
                src="${posterIMG}"
                data-backdrop="${backdropIMG}"
                alt="${title}">
            <h4 class="tv-card__head">${title}</h4>
            </a>
        `;
        loading.remove();
        tvShowsList.append(card);
    });}else{
        loading.remove();
        tvShowsList.textContent = 'По вашему запросу сериалов не найдено...'
    }
    pagination.textContent='';
    if (response.total_pages > 1){
        for (let i=1;i<=response.total_pages;i++){
            pagination.innerHTML+=`<li><a href="#" class="pages">${i}</a></li>`;
        }
    }
};

//поисковик
searchForm.addEventListener('submit',(event)=>{
    event.preventDefault();
    const value = searchFormInput.value.trim(); //trim убирает пробелы
    if (value){
        tvShows.append(loading);
        dbService.getSearchResult(value).then(rendercard);
        searchFormInput.value='';
    }
});

dbService.getPopular().then(rendercard);

//смена картинки при наведении
const changeImage = event =>{
    const card = event.target.closest('.tv-shows__item');
    if (card){
        const img = card.querySelector('.tv-card__img');
        if (img.dataset.backdrop){
            [img.src, img.dataset.backdrop]=[img.dataset.backdrop,img.src];
        }
    }
};
       
tvShowsList.addEventListener('mouseover',changeImage);
tvShowsList.addEventListener('mouseout',changeImage);

pagination.addEventListener('click',(event)=>{
    event.preventDefault();
    if (event.target.classList.contains('pages')){
        tvShows.append(loading);
        dbService.getNextPage(event.target.textContent).then(rendercard);
    }
});
