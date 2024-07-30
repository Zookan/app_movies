const apiKey = '9a310b7d46fbc7e00fbc62646ecc790c';
const baseImageUrl = 'https://image.tmdb.org/t/p/w500';

// Fonction pour récupérer les détails d'un film
function fetchMovieDetails(movieId, callback) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`;
    
    fetch(url)
        .then(response => response.json())
        .then(movie => {
            callback(movie);
        })
        .catch(err => console.error(err));
}

// Fonction pour afficher un film
function displayMovie(movie, container, listType) {
    const movieElement = document.createElement('div');
    movieElement.classList.add('movie-item');
    movieElement.setAttribute('data-id', movie.id); // Ajouter l'attribut data-id
    movieElement.innerHTML = `
        <h3>${movie.title}</h3>
        <img src="${baseImageUrl}${movie.poster_path || 'default-image.jpg'}" alt="${movie.title}">
        <p><strong>Release Date:</strong> ${movie.release_date}</p>
        <p><strong>Overview:</strong> ${movie.overview}</p>
        <button class="remove-button">Remove</button>
    `;

    // Ajout de l'événement de suppression
    movieElement.querySelector('.remove-button').addEventListener('click', () => {
        removeMovie(movie.id, listType);
    });

    // Ajout de l'événement de redirection
    movieElement.addEventListener('click', (event) => {
        if (!event.target.classList.contains('remove-button')) {
            window.location.href = `SearchMovies.html?movieId=${movie.id}`; // Redirection vers la page de recherche avec l'ID du film
        }
    });

    container.appendChild(movieElement);
}

// Fonction pour supprimer un film de la watchlist ou des films vus
function removeMovie(movieId, listType) {
    let moviesList = JSON.parse(localStorage.getItem(listType)) || [];
    moviesList = moviesList.filter(id => id !== movieId);
    localStorage.setItem(listType, JSON.stringify(moviesList));
    displayMovies(); // Mettre à jour l'affichage
}

// Fonction pour afficher les films vus et la watchlist
function displayMovies() {
    const watchedMoviesContainer = document.getElementById('watchedMovies');
    const watchlistContainer = document.getElementById('watchlist');

    const watchedMovies = JSON.parse(localStorage.getItem('watchedMovies')) || [];
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

    watchedMoviesContainer.innerHTML = '';
    watchlistContainer.innerHTML = '';

    if (watchedMovies.length > 0) {
        watchedMovies.forEach(movieId => {
            fetchMovieDetails(movieId, movie => displayMovie(movie, watchedMoviesContainer, 'watchedMovies'));
        });
    } else {
        watchedMoviesContainer.textContent = 'No watched movies found.';
    }

    if (watchlist.length > 0) {
        watchlist.forEach(movieId => {
            fetchMovieDetails(movieId, movie => displayMovie(movie, watchlistContainer, 'watchlist'));
        });
    } else {
        watchlistContainer.textContent = 'No movies in watchlist found.';
    }
}

document.addEventListener('DOMContentLoaded', displayMovies);