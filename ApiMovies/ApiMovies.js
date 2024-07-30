const apiKey = '9a310b7d46fbc7e00fbc62646ecc790c';
const baseImageUrl = 'https://image.tmdb.org/t/p/w500';

// Event click sur le search button
document.getElementById('searchButton').addEventListener('click', () => {
    const query = document.getElementById('queryInput').value;
    searchMovies(query);
});

function searchMovies(query) {
    const url = `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1&api_key=${apiKey}`;

    // Fetch pour récupérer la liste des films en fonction du query
    fetch(url)
        .then(response => response.json())
        .then(response => {
            const resultsContainer = document.getElementById('results');
            resultsContainer.innerHTML = '';
            if (response.results && response.results.length > 0) {
                response.results.forEach(movie => {
                    const movieElement = document.createElement('div');
                    movieElement.textContent = movie.title;
                    movieElement.classList.add('movie-item');
                    movieElement.addEventListener('click', () => fetchMovieDetails(movie.id));
                    resultsContainer.appendChild(movieElement);
                });
            } else {
                resultsContainer.textContent = 'No results found.';
            }
        })
        .catch(err => console.error(err));
}

// -------------------- Fetch --------------------

// Fetch pour récupérer les détails d'un film
function fetchMovieDetails(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`;

    fetch(url)
        .then(response => response.json())
        .then(movie => {
            displayMovieDetails(movie);
            fetchMovieCredits(movieId); // Ajouter cet appel pour obtenir les crédits
        })
        .catch(err => console.error(err));
}

// Fetch pour récupérer le cast d'un film
function fetchMovieCast(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const cast = data.cast.slice(0, 10);
            displayMovieCast(cast);
        })
        .catch(err => console.error(err));
}

// Fetch pour récupérer le réalisateur d'un film
function fetchMovieCredits(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const director = data.crew.find(member => member.job === 'Director'); // Trouver le réalisateur
            if (director) {
                displayMovieDirector(director.name, director.id); // Passer l'id du réalisateur
            } else {
                displayMovieDirector('Unknown');
            }
            displayMovieCast(data.cast);
        })
        .catch(err => console.error(err));
}

// Fetch pour récupérer les films d'un acteur
function showActorMovies(actorId, actorName) {
    document.getElementById('actorMoviesTitle').textContent = `Movies with ${actorName}`;
    fetchActorMovies(actorId, actorName);
}
function fetchActorMovies(actorId, actorName) {
    const url = `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${apiKey}&language=en-US`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayActorMovies(data.cast, actorName); // Passer le nom de l'acteur ici
        })
        .catch(err => console.error(err));
}

// Fetch pour récupérer les films d'un réalisateur
function showDirectorMovies(directorId, directorName) {
    document.getElementById('actorMoviesTitle').textContent = `Movies by ${directorName}`;
    fetchDirectorMovies(directorId);
}
function fetchDirectorMovies(directorId) {
    const url = `https://api.themoviedb.org/3/person/${directorId}/movie_credits?api_key=${apiKey}&language=en-US`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayActorMovies(data.cast, ''); // Utiliser le nom vide ici pour les films du réalisateur
        })
        .catch(err => console.error(err));
}

// -------------------- Display --------------------

// Fonction pour afficher les détails d'un film
function displayMovieDetails(movie) {
    const movieDetailsContainer = document.getElementById('movieDetails');
    movieDetailsContainer.classList.remove('actor-movies-grid');
    document.getElementById('actorMoviesTitle').style.display = 'none';

    movieDetailsContainer.innerHTML = `
        <div class="movie-details">
            <div class="details-left">
                <h2>${movie.title}</h2>
                <img src="${baseImageUrl}${movie.poster_path || 'default-image.jpg'}" alt="${movie.title}">
            </div>
            <div class="details-right">
                <p><strong>Release Date:</strong> ${movie.release_date}</p>
                <p><strong>Overview:</strong> ${movie.overview}</p>
                <p><strong>Rating:</strong> ${movie.vote_average}</p>
                <p><strong>Popularity:</strong> ${movie.popularity}</p>
                <p><strong>Genres:</strong> ${movie.genres.map(genre => genre.name).join(', ')}</p>
                <p id="movieDirector"><strong>Director:</strong> Loading...</p>
                <p id="movieCast"><strong>Cast:</strong> Loading...</p>
                <button id="markAsWatchedButton">Mark as Watched</button>
                <button id="addToWatchlistButton">Add to Watchlist</button>
            </div>
        </div>
    `;

    document.getElementById('markAsWatchedButton').addEventListener('click', () => markAsWatched(movie.id));
    document.getElementById('addToWatchlistButton').addEventListener('click', () => addToWatchlist(movie.id));
}

// Fonction pour marquer un film comme "vu"
function markAsWatched(movieId) {
    let watchedMovies = JSON.parse(localStorage.getItem('watchedMovies')) || [];
    if (!watchedMovies.includes(movieId)) {
        watchedMovies.push(movieId);
        localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
        alert('Movie marked as watched');
    } else {
        alert('Movie already marked as watched');
    }
}

// Fonction pour ajouter un film à la "watchlist"
function addToWatchlist(movieId) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    if (!watchlist.includes(movieId)) {
        watchlist.push(movieId);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        alert('Movie added to watchlist');
    } else {
        alert('Movie already in watchlist');
    }
}

// Fonction pour afficher les acteurs d'un film
function displayMovieCast(cast) {
    const movieCastElement = document.getElementById('movieCast');
    movieCastElement.innerHTML = '<strong>Cast:</strong> ' + cast.map(actor => {
        return `<a href="#" onclick="showActorMovies(${actor.id}, '${actor.name}')">${actor.name}</a>`;
    }).join(', ');
}

// Fonction pour afficher le réalisateur d'un film
function displayMovieDirector(directorName, directorId) {
    const movieDirectorElement = document.getElementById('movieDirector');
    movieDirectorElement.innerHTML = `<strong>Director:</strong> <a href="#" onclick="showDirectorMovies(${directorId}, '${directorName}')">${directorName}</a>`;
}

// Fonction pour afficher les films d'un acteur
function displayActorMovies(movies, actorName) {
    const movieDetailsContainer = document.getElementById('movieDetails');

    // Mettre à jour le titre avec le nom de l'acteur
    const actorMoviesTitle = document.getElementById('actorMoviesTitle');
    actorMoviesTitle.textContent = `Movies with ${actorName}`;
    actorMoviesTitle.style.display = 'block'; // Afficher le titre
    movieDetailsContainer.classList.add('actor-movies-grid'); // Ajouter la classe de grille
    movieDetailsContainer.innerHTML = '';

    if (movies.length > 0) {
        movies.forEach(movie => {
            const movieElement = document.createElement('div');
            movieElement.classList.add('actor-movie-item');

            const posterPath = movie.poster_path ? `${baseImageUrl}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';

            movieElement.innerHTML = `
                <img src="${posterPath}" alt="${movie.title}">
                <h3>${movie.title}</h3>
                <p><strong>Year:</strong> ${new Date(movie.release_date).getFullYear()}</p>
                <p>${movie.overview}</p>
            `;
            movieElement.addEventListener('click', () => {
                fetchMovieDetails(movie.id);
            });
            movieDetailsContainer.appendChild(movieElement);
        });
    } else {
        movieDetailsContainer.textContent = 'No movies found for this actor.';
    }
}

// Fonction pour afficher les films d'un réalisateur
function displayActorMovies(movies, actorName) {
    const movieDetailsContainer = document.getElementById('movieDetails');

    // Mettre à jour le titre
    const actorMoviesTitle = document.getElementById('actorMoviesTitle');
    actorMoviesTitle.textContent = actorName ? `Movies with ${actorName}` : `Movies by ${actorName}`;
    actorMoviesTitle.style.display = 'block'; // Afficher le titre
    movieDetailsContainer.classList.add('actor-movies-grid'); // Ajouter la classe de grille
    movieDetailsContainer.innerHTML = '';

    if (movies.length > 0) {
        movies.forEach(movie => {
            const movieElement = document.createElement('div');
            movieElement.classList.add('actor-movie-item');

            const posterPath = movie.poster_path ? `${baseImageUrl}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';

            movieElement.innerHTML = `
                <img src="${posterPath}" alt="${movie.title}">
                <h3>${movie.title}</h3>
                <p><strong>Year:</strong> ${new Date(movie.release_date).getFullYear()}</p>
                <p>${movie.overview}</p>
            `;
            movieElement.addEventListener('click', () => {
                fetchMovieDetails(movie.id);
            });
            movieDetailsContainer.appendChild(movieElement);
        });
    } else {
        movieDetailsContainer.textContent = 'No movies found.';
    }
}
