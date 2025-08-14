// Configuración de la API utilizada
const API_KEY = "ab3a20d938c172d5e08c457a964f68d1"
const BASE_URL = "https://api.themoviedb.org/3"
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original"

// Variables globales
let currentMovies = []
const favoriteMovies = JSON.parse(localStorage.getItem("favoriteMovies")) || []
let allGenres = []
let currentCategory = "trending"
let currentPage = 1
let isLoadingMore = false
let hasMorePages = true

// Elementos del DOM
const movieListsContainer = document.getElementById("movieListsContainer")
const loadingSpinner = document.getElementById("loadingSpinner")
const featuredContent = document.getElementById("featuredContent")
const featuredMovieTitle = document.getElementById("featuredMovieTitle")
const featuredDesc = document.getElementById("featuredDesc")
const featuredRating = document.getElementById("featuredRating")
const featuredDate = document.getElementById("featuredDate")
const watchBtn = document.getElementById("watchBtn")
const addToFavBtn = document.getElementById("addToFavBtn")
const searchInput = document.getElementById("searchInput")
const searchBtn = document.getElementById("searchBtn")
const menuItems = document.querySelectorAll(".menu-list-item")
const filtersContainer = document.getElementById("filtersContainer")
const genreFilter = document.getElementById("genreFilter")
const yearFilter = document.getElementById("yearFilter")
const ratingFilter = document.getElementById("ratingFilter")
const favoritesIcon = document.getElementById("favoritesIcon")
const statsIcon = document.getElementById("statsIcon")
const filtersIcon = document.getElementById("filtersIcon")
const movieModal = document.getElementById("movieModal")
const statsModal = document.getElementById("statsModal")
const toggleBall = document.querySelector(".toggle-ball")
const themeToggleItems = document.querySelectorAll(
    ".container,.movie-list-title,.navbar-container,.sidebar,.left-menu-icon,.toggle,.filters-container,.filters-container select,.modal-content,.modal-info h2,.modal-info p,.modal-details p,.rating-circle,.genre-name,.genre-count",
)

// Inicialización de la aplicación cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM cargado. Inicializando CodeFlix...")
    initializeApp()
    setupEventListeners()
})

// Función principal de inicialización
async function initializeApp() {
    showLoading(true)
    try {
        console.log("Paso 1: Cargando géneros...")
        await loadGenres()
        console.log("Paso 2: Poblando filtro de años...")
        populateYearFilter()
        console.log("Paso 3: Cargando películas iniciales (trending)...")
        await loadMoviesByCategory(currentCategory)
        console.log("CodeFlix inicializado con éxito.")
    } catch (error) {
        console.error("Error crítico al inicializar la aplicación:", error)
        showError("No se pudo cargar la aplicación. Por favor, verifica tu conexión a internet o tu API Key.")
    } finally {
        showLoading(false)
    }
}

// Configuración de todos los event listeners
function setupEventListeners() {
    console.log("Configurando event listeners...")

    // Búsqueda
    if (searchBtn) searchBtn.addEventListener("click", handleSearch)
    if (searchInput) {
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                handleSearch()
            }
        })
    }
    const sidebarSearchIcon = document.getElementById("sidebarSearchIcon")
    if (sidebarSearchIcon) sidebarSearchIcon.addEventListener("click", () => searchInput.focus())
    const sidebarHomeIcon = document.getElementById("sidebarHomeIcon")
    if (sidebarHomeIcon) {
        sidebarHomeIcon.addEventListener("click", () => {
            menuItems.forEach((mi) => mi.classList.remove("active"))
            const trendingMenuItem = document.querySelector('.menu-list-item[data-category="trending"]')
            if (trendingMenuItem) trendingMenuItem.classList.add("active")
            currentCategory = "trending"
            loadMoviesByCategory("trending")
        })
    }

    // Navegación por categorías
    menuItems.forEach((item) => {
        item.addEventListener("click", function () {
            menuItems.forEach((mi) => mi.classList.remove("active"))
            this.classList.add("active")

            const category = this.dataset.category
            if (category === "favorites") {
                showFavorites()
            } else {
                currentCategory = category
                loadMoviesByCategory(category)
            }
            if (filtersContainer) filtersContainer.style.display = "none"
        })
    })

    // Filtros
    if (filtersIcon) filtersIcon.addEventListener("click", toggleFilters)
    if (genreFilter) genreFilter.addEventListener("change", applyFilters)
    if (yearFilter) yearFilter.addEventListener("change", applyFilters)
    if (ratingFilter) ratingFilter.addEventListener("change", applyFilters)

    // Favoritos y Estadísticas (desde sidebar)
    if (favoritesIcon) favoritesIcon.addEventListener("click", showFavorites)
    if (statsIcon) statsIcon.addEventListener("click", showStats)

    // Toggle de tema
    if (toggleBall) toggleBall.addEventListener("click", setupThemeToggle)

    // Cierre de modales
    document.querySelectorAll(".modal .close").forEach((btn) => {
        btn.addEventListener("click", function () {
            this.closest(".modal").style.display = "none"
        })
    })
    window.addEventListener("click", (event) => {
        if (movieModal && event.target === movieModal) {
            movieModal.style.display = "none"
        }
        if (statsModal && event.target === statsModal) {
            statsModal.style.display = "none"
        }
    })

    console.log("Event listeners configurados.")
}

// Mostrar/ocultar spinner de carga
function showLoading(show) {
    if (loadingSpinner) {
        loadingSpinner.style.display = show ? "flex" : "none"
    }
}

// Mostrar mensaje de error en la interfaz
function showError(message) {
    if (movieListsContainer) {
        movieListsContainer.innerHTML = `
                        <div style="text-align: center; padding: 50px; color: #e50914;">
                                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                                <h2>¡Ups! Algo salió mal.</h2>
                                <p>${message}</p>
                                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #e50914; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                        Reintentar
                                </button>
                        </div>
                `
    }
    if (featuredContent) {
        featuredContent.style.display = "none"
    }
}

// Cargar películas de una categoría específica
async function loadMoviesByCategory(category, page = 1, append = false) {
    console.log(`Intentando cargar películas para la categoría: ${category}, página: ${page}`)

    if (!append) {
        showLoading(true)
        currentMovies = []
        currentPage = 1
        hasMorePages = true
    } else {
        isLoadingMore = true
    }

    try {
        let endpoint
        switch (category) {
            case "trending":
                endpoint = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=es-ES&page=${page}`
                break
            case "popular":
                endpoint = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=${page}`
                break
            case "top_rated":
                endpoint = `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=es-ES&page=${page}`
                break
            case "upcoming":
                endpoint = `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=es-ES&page=${page}`
                break
            default:
                endpoint = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=es-ES&page=${page}`
        }

        console.log(`Realizando fetch a: ${endpoint}`)
        const response = await fetch(endpoint)

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`Error en la respuesta HTTP: ${response.status} - ${errorText}`)
            throw new Error(`Error HTTP: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        console.log("Datos recibidos de la API:", data)

        if (!data.results || data.results.length === 0) {
            if (!append) {
                movieListsContainer.innerHTML = `
                    <div style="text-align: center; padding: 100px; color: #666;">
                        <i class="fas fa-film" style="font-size: 4rem; margin-bottom: 20px;"></i>
                        <h2>No se encontraron películas en esta categoría.</h2>
                    </div>
                `
                if (featuredContent) featuredContent.style.display = "none"
            }
            hasMorePages = false
            return
        }

        if (append) {
            currentMovies = [...currentMovies, ...data.results]
        } else {
            currentMovies = data.results
            if (featuredContent) featuredContent.style.display = "flex"
            displayFeaturedMovie(currentMovies[0])
        }

        // Verificar si hay más páginas
        hasMorePages = page < data.total_pages
        currentPage = page

        displayMovieList(currentMovies, getCategoryTitle(category))

        console.log(`Películas cargadas para ${category}: ${currentMovies.length} elementos total.`)
    } catch (error) {
        console.error("Error al cargar películas:", error)
        if (!append) {
            showError(
                `No se pudieron cargar las películas de ${getCategoryTitle(category).toLowerCase()}. Detalle: ${error.message}`,
            )
        }
    } finally {
        if (!append) {
            showLoading(false)
        }
        isLoadingMore = false
    }
}

// Obtener título legible para la categoría
function getCategoryTitle(category) {
    const titles = {
        trending: "TENDENCIAS DE LA SEMANA",
        popular: "PELÍCULAS POPULARES",
        top_rated: "MEJOR CALIFICADAS",
        upcoming: "PRÓXIMOS ESTRENOS",
        favorites: "MIS PELÍCULAS FAVORITAS",
    }
    return titles[category] || "PELÍCULAS"
}

// Mostrar la película destacada en la sección principal
function displayFeaturedMovie(movie) {
    if (
        !movie ||
        !featuredContent ||
        !featuredMovieTitle ||
        !featuredDesc ||
        !featuredRating ||
        !featuredDate ||
        !watchBtn ||
        !addToFavBtn
    ) {
        console.warn("Elementos del DOM para película destacada no encontrados o película inválida.")
        return
    }

    featuredMovieTitle.textContent = movie.title || movie.name || "Título no disponible"
    featuredDesc.textContent = movie.overview || "Sinopsis no disponible."
    featuredRating.textContent = `⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}`

    // Formatear fecha usando JavaScript nativo
    if (movie.release_date) {
        const releaseDate = new Date(movie.release_date)
        featuredDate.textContent = releaseDate.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    } else {
        featuredDate.textContent = "Fecha no disponible"
    }

    // Establecer imagen de fondo
    if (movie.backdrop_path) {
        featuredContent.style.backgroundImage = `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%), url(${BACKDROP_BASE_URL}${movie.backdrop_path})`
    } else {
        featuredContent.style.backgroundImage = `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%), url(data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'%3E%3Crect width='100%25' height='100%25' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23fff' font-size='24'%3EImagen no disponible%3C/text%3E%3C/svg%3E)`
    }

    // Event listeners para botones del hero
    watchBtn.onclick = () => showMovieDetails(movie)
    addToFavBtn.onclick = () => toggleFavorite(movie)
}

// Mostrar una lista de películas con navegación mejorada
function displayMovieList(movies, title) {
    if (!movieListsContainer) {
        console.warn("Contenedor de listas de películas no encontrado.")
        return
    }

    movieListsContainer.innerHTML = ""

    const movieListContainer = document.createElement("div")
    movieListContainer.className = "movie-list-container"

    const movieListWrapper = document.createElement("div")
    movieListWrapper.className = "movie-list-wrapper"

    const movieListDiv = document.createElement("div")
    movieListDiv.className = "movie-list"
    movieListDiv.id = `movieList-${title.replace(/\s/g, "-").toLowerCase()}`

    movies.forEach((movie) => {
        movieListDiv.appendChild(createMovieCard(movie))
    })

    // Flecha derecha
    const rightArrow = document.createElement("i")
    rightArrow.className = "fas fa-chevron-right arrow right-arrow"

    // Flecha izquierda
    const leftArrow = document.createElement("i")
    leftArrow.className = "fas fa-chevron-left arrow left-arrow"

    // Indicador de paginación
    const paginationIndicator = document.createElement("div")
    paginationIndicator.className = "pagination-indicator"
    paginationIndicator.textContent = `${movies.length} películas`

    movieListWrapper.appendChild(movieListDiv)
    movieListWrapper.appendChild(rightArrow)
    movieListWrapper.appendChild(leftArrow)
    movieListWrapper.appendChild(paginationIndicator)

    const listTitle = document.createElement("h1")
    listTitle.className = "movie-list-title"
    listTitle.textContent = title

    movieListContainer.appendChild(listTitle)
    movieListContainer.appendChild(movieListWrapper)

    // Mostrar indicador de carga si estamos cargando más
    if (isLoadingMore) {
        const loadingMore = document.createElement("div")
        loadingMore.className = "loading-more"
        loadingMore.innerHTML = `
            <div class="spinner"></div>
            <span>Cargando más películas...</span>
        `
        movieListContainer.appendChild(loadingMore)
    }

    movieListsContainer.appendChild(movieListContainer)

    // Configurar las flechas después de agregar al DOM
    setupArrowNavigation()
}

// Función para configurar la navegación con flechas 
function setupArrowNavigation() {
    const arrows = document.querySelectorAll(".arrow")
    const movieLists = document.querySelectorAll(".movie-list")

    arrows.forEach((arrow, i) => {
        // Calcular el índice correcto de la lista
        const listIndex = Math.floor(i / 2) 
        const movieList = movieLists[listIndex]

        if (!movieList) return

        const itemNumber = movieList.querySelectorAll(".movie-list-item").length

        // Inicializar contador si no existe
        if (!movieList.clickCounter) {
            movieList.clickCounter = 0
        }

        arrow.addEventListener("click", () => {
            const ratio = Math.floor(window.innerWidth / 300) 
            const isRightArrow = arrow.classList.contains("right-arrow")

            if (isRightArrow) {
                // Flecha derecha
                movieList.clickCounter++

                // Verificar si necesitamos cargar más películas
                const remainingItems = itemNumber - (4 + movieList.clickCounter) + (4 - ratio)

                if (remainingItems >= 0) {
                    const currentTransform = movieList.style.transform
                    const currentX = currentTransform ? Number.parseInt(currentTransform.match(/-?\d+/)?.[0] || 0) : 0
                    movieList.style.transform = `translateX(${currentX - 320}px)`

                    // Si quedan pocas películas y hay más páginas va a cargar más
                    if (remainingItems <= 3 && hasMorePages && !isLoadingMore && currentCategory !== "favorites") {
                        loadMoreMovies()
                    }
                } else {
                    movieList.style.transform = "translateX(0)"
                    movieList.clickCounter = 0
                }
            } else {
                // Flecha izquierda
                if (movieList.clickCounter > 0) {
                    movieList.clickCounter--
                    const currentTransform = movieList.style.transform
                    const currentX = currentTransform ? Number.parseInt(currentTransform.match(/-?\d+/)?.[0] || 0) : 0
                    movieList.style.transform = `translateX(${currentX + 320}px)`
                }
            }

            // Actualizar visibilidad de las flechas
            updateArrowVisibility(movieList, arrow.parentElement)
        })
    })

    console.log("Navegación con flechas configurada para", movieLists.length, "listas")
}

// Función para actualizar la visibilidad de las flechas
function updateArrowVisibility(movieList, wrapper) {
    const leftArrow = wrapper.querySelector(".left-arrow")
    const rightArrow = wrapper.querySelector(".right-arrow")
    const itemNumber = movieList.querySelectorAll(".movie-list-item").length
    const ratio = Math.floor(window.innerWidth / 300)

    if (leftArrow) {
        leftArrow.style.opacity = movieList.clickCounter > 0 ? "1" : "0.3"
    }

    if (rightArrow) {
        const canScrollRight = itemNumber - (4 + movieList.clickCounter) + (4 - ratio) >= 0
        rightArrow.style.opacity = canScrollRight ? "1" : "0.3"
    }
}

// Crear una tarjeta de película individual
function createMovieCard(movie) {
    const movieCard = document.createElement("div")
    movieCard.classList.add("movie-list-item")
    movieCard.dataset.movieId = movie.id

    const isFavorite = favoriteMovies.some((fav) => fav.id === movie.id)
    const heartIconClass = isFavorite ? "fas fa-heart" : "far fa-heart"
    const posterPath = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23fff'%3EPóster no disponible%3C/text%3E%3C/svg%3E"

    movieCard.innerHTML = `
                <img class="movie-list-item-img" src="${posterPath}" alt="${movie.title || movie.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'300\\'%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' fill=\\'%23333\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\' fill=\\'%23fff\\'%3EPóster no disponible%3C/text%3E%3C/svg%3E'">
                <div class="movie-overlay">
                        <div class="movie-list-item-title">${movie.title || movie.name || "Sin título"}</div>
                        <div class="movie-list-item-rating">⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</div>
                        <button class="movie-list-item-button" aria-label="Agregar/Quitar de favoritos" onclick="event.stopPropagation(); toggleFavoriteById(${movie.id})">
                                <i class="${heartIconClass}"></i>
                        </button>
                </div>
        `

    // Al hacer click en la película, actualizar la sección featured Y mostrar detalles
    movieCard.addEventListener("click", () => {
        displayFeaturedMovie(movie) 
        showMovieDetails(movie) 
    })

    return movieCard
}

// Manejar la búsqueda de películas
async function handleSearch() {
    const query = searchInput ? searchInput.value.trim() : ""
    if (!query) {
        showNotification("Por favor, ingresa un término de búsqueda.", "info")
        return
    }

    console.log(`Realizando búsqueda para: ${query}`)
    showLoading(true)
    try {
        const response = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`,
        )
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Error HTTP: ${response.status} - ${errorText}`)
        }
        const data = await response.json()

        if (data.results.length === 0) {
            movieListsContainer.innerHTML = `
                                <div style="text-align: center; padding: 100px; color: #666;">
                                        <i class="fas fa-frown" style="font-size: 4rem; margin-bottom: 20px;"></i>
                                        <h2>No se encontraron resultados para "${query}".</h2>
                                        <p>Intenta con otro término de búsqueda.</p>
                                </div>
                        `
            if (featuredContent) featuredContent.style.display = "none"
            return
        }

        currentMovies = data.results
        if (featuredContent) featuredContent.style.display = "flex"
        displayFeaturedMovie(currentMovies[0])
        displayMovieList(data.results.slice(0, 40), `RESULTADOS PARA "${query.toUpperCase()}"`) // Limitar a 40 resultados de búsqueda
        console.log(`Búsqueda completada para "${query}": ${currentMovies.length} resultados.`)
    } catch (error) {
        console.error("Error al buscar películas:", error)
        showError(`Error al realizar la búsqueda: ${error.message}`)
    } finally {
        showLoading(false)
    }
}

// Cargar la lista de géneros de TMDB
async function loadGenres() {
    console.log("Cargando géneros...")
    try {
        const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=es-ES`)
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Error HTTP: ${response.status} - ${errorText}`)
        }
        const data = await response.json()
        allGenres = data.genres || []
        console.log("Géneros cargados:", allGenres.length)

        // Poblar el select de géneros
        if (genreFilter) {
            genreFilter.innerHTML = '<option value="">Todos los géneros</option>'
            allGenres.forEach((genre) => {
                const option = document.createElement("option")
                option.value = genre.id
                option.textContent = genre.name
                genreFilter.appendChild(option)
            })
        }
    } catch (error) {
        console.error("Error al cargar géneros:", error)
        showNotification(`No se pudieron cargar los géneros para los filtros. Detalle: ${error.message}`, "error")
    }
}

// Poblar el filtro de años
function populateYearFilter() {
    if (!yearFilter) return
    const currentYear = new Date().getFullYear()
    yearFilter.innerHTML = '<option value="">Todos los años</option>'
    for (let year = currentYear; year >= 1970; year--) {
        const option = document.createElement("option")
        option.value = year
        option.textContent = year
        yearFilter.appendChild(option)
    }
}

// Mostrar/ocultar el contenedor de filtros
function toggleFilters() {
    if (filtersContainer) {
        const isVisible = filtersContainer.style.display !== "none"
        filtersContainer.style.display = isVisible ? "none" : "block"
    }
}

// Aplicar filtros a las películas
async function applyFilters() {
    console.log("Aplicando filtros...")
    showLoading(true)
    try {
        const selectedGenre = genreFilter ? genreFilter.value : ""
        const selectedYear = yearFilter ? yearFilter.value : ""
        const selectedRating = ratingFilter ? ratingFilter.value : ""

        const filterParams = []
        if (selectedGenre) filterParams.push(`with_genres=${selectedGenre}`)
        if (selectedYear) filterParams.push(`primary_release_year=${selectedYear}`)
        if (selectedRating) filterParams.push(`vote_average.gte=${selectedRating}`)

        const endpoint = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&sort_by=popularity.desc&${filterParams.join("&")}`
        console.log(`Realizando fetch de filtros a: ${endpoint}`)

        const response = await fetch(endpoint)
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Error HTTP: ${response.status} - ${errorText}`)
        }
        const data = await response.json()

        if (data.results.length === 0) {
            movieListsContainer.innerHTML = `
                                <div style="text-align: center; padding: 100px; color: #666;">
                                        <i class="fas fa-filter" style="font-size: 4rem; margin-bottom: 20px;"></i>
                                        <h2>No se encontraron películas con los filtros aplicados.</h2>
                                        <p>Intenta ajustar tus criterios de búsqueda.</p>
                                </div>
                        `
            if (featuredContent) featuredContent.style.display = "none"
            return
        }

        currentMovies = data.results
        if (featuredContent) featuredContent.style.display = "flex"
        displayFeaturedMovie(currentMovies[0])
        displayMovieList(data.results.slice(0, 60), "PELÍCULAS FILTRADAS") // Limitar a 60 resultados filtrados
        console.log(`Filtros aplicados: ${currentMovies.length} resultados.`)
    } catch (error) {
        console.error("Error al aplicar filtros:", error)
        showError(`Error al aplicar filtros: ${error.message}`)
    } finally {
        showLoading(false)
    }
}

// Función auxiliar para toggle favorite por ID
function toggleFavoriteById(movieId) {
    const movie = currentMovies.find((m) => m.id === movieId) || favoriteMovies.find((m) => m.id === movieId)
    if (movie) {
        toggleFavorite(movie)
    }
}

// Agregar/quitar película de favoritos
function toggleFavorite(movie) {
    const existingIndex = favoriteMovies.findIndex((fav) => fav.id === movie.id)

    if (existingIndex > -1) {
        favoriteMovies.splice(existingIndex, 1)
        showNotification(`${movie.title || movie.name} eliminado de favoritos`, "success")
    } else {
        favoriteMovies.push(movie)
        showNotification(`${movie.title || movie.name} agregado a favoritos`, "success")
    }

    localStorage.setItem("favoriteMovies", JSON.stringify(favoriteMovies))

    // Actualizar la UI si estamos en la vista de favoritos
    if (currentCategory === "favorites") {
        showFavorites()
    }
    // Actualizar el icono de corazón en la tarjeta si está visible
    const movieCardElement = document.querySelector(
        `.movie-list-item[data-movie-id="${movie.id}"] .movie-list-item-button i`,
    )
    if (movieCardElement) {
        movieCardElement.className = existingIndex > -1 ? "far fa-heart" : "fas fa-heart"
    }
}

// Mostrar la lista de películas favoritas
function showFavorites() {
    currentCategory = "favorites"
    if (favoriteMovies.length === 0) {
        movieListsContainer.innerHTML = `
                        <div style="text-align: center; padding: 100px; color: #666;">
                                <i class="fas fa-heart" style="font-size: 4rem; margin-bottom: 20px;"></i>
                                <h2>No tienes películas favoritas</h2>
                                <p>Agrega películas a tus favoritos para verlas aquí</p>
                        </div>
                `
        if (featuredContent) featuredContent.style.display = "none"
        return
    }

    if (featuredContent) featuredContent.style.display = "flex"
    displayFeaturedMovie(favoriteMovies[0])
    displayMovieList(favoriteMovies, "MIS PELÍCULAS FAVORITAS")
}

// Mostrar el modal de detalles de la película
async function showMovieDetails(movie) {
    console.log(`Mostrando detalles para la película: ${movie.title || movie.name}`)
    showLoading(true)
    try {
        // Obtener detalles completos de la película
        const response = await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=es-ES`)
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Error HTTP: ${response.status} - ${errorText}`)
        }
        const movieDetails = await response.json()
        console.log("Detalles de película recibidos:", movieDetails)

        if (document.getElementById("modalPoster")) {
            document.getElementById("modalPoster").src = movieDetails.poster_path
                ? `${IMAGE_BASE_URL}${movieDetails.poster_path}`
                : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450'%3E%3Crect width='100%25' height='100%25' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23fff'%3EPóster no disponible%3C/text%3E%3C/svg%3E"
        }
        if (document.getElementById("modalTitle")) {
            document.getElementById("modalTitle").textContent =
                movieDetails.title || movieDetails.name || "Título no disponible"
        }
        if (document.getElementById("modalOverview")) {
            document.getElementById("modalOverview").textContent = movieDetails.overview || "Sinopsis no disponible."
        }

        if (document.getElementById("modalDate")) {
            if (movieDetails.release_date) {
                const releaseDate = new Date(movieDetails.release_date)
                document.getElementById("modalDate").textContent = releaseDate.toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })
            } else {
                document.getElementById("modalDate").textContent = "Fecha no disponible"
            }
        }

        if (document.getElementById("modalRating")) {
            document.getElementById("modalRating").textContent =
                `${movieDetails.vote_average ? movieDetails.vote_average.toFixed(1) : "N/A"}/10`
        }
        if (document.getElementById("modalGenres")) {
            document.getElementById("modalGenres").textContent = movieDetails.genres
                ? movieDetails.genres.map((g) => g.name).join(", ")
                : "N/A"
        }
        if (document.getElementById("modalRuntime")) {
            document.getElementById("modalRuntime").textContent = movieDetails.runtime
                ? `${movieDetails.runtime} minutos`
                : "N/A"
        }

        createRatingChart(movieDetails.vote_average || 0)

        if (movieModal) movieModal.style.display = "block"
    } catch (error) {
        console.error("Error al cargar detalles de la película:", error)
        showNotification(`No se pudieron cargar los detalles de la película. Detalle: ${error.message}`, "error")
    } finally {
        showLoading(false)
    }
}

// Crear gráfica de rating personalizada 
function createRatingChart(rating) {
    const ratingValue = document.getElementById("ratingValue")
    const ratingCircle = document.querySelector(".rating-circle")

    if (!ratingValue || !ratingCircle) {
        console.warn("Elementos para rating chart no encontrados.")
        return
    }

    ratingValue.textContent = rating.toFixed(1)

    const ratingDegrees = (rating / 10) * 360
    ratingCircle.style.setProperty("--rating-deg", `${ratingDegrees}deg`)
}

// Mostrar el modal de estadísticas
function showStats() {
    if (favoriteMovies.length === 0) {
        showNotification("Agrega películas a favoritos para ver estadísticas.", "info")
        return
    }

    if (document.getElementById("totalFavorites")) {
        document.getElementById("totalFavorites").textContent = favoriteMovies.length
    }

    const genreCount = {}
    favoriteMovies.forEach((movie) => {
        if (movie.genre_ids) {
            movie.genre_ids.forEach((genreId) => {
                const genre = allGenres.find((g) => g.id === genreId)
                if (genre) {
                    genreCount[genre.name] = (genreCount[genre.name] || 0) + 1
                }
            })
        }
    })

    const topGenre = Object.keys(genreCount).reduce(
        (a, b) => (genreCount[a] > genreCount[b] ? a : b),
        Object.keys(genreCount)[0],
    )
    if (document.getElementById("favoriteGenre")) {
        document.getElementById("favoriteGenre").textContent = topGenre || "N/A"
    }

    createGenreChart(genreCount)

    if (statsModal) statsModal.style.display = "block"
}

// Crear gráfica de géneros personalizada 
function createGenreChart(genreCount) {
    const genreChart = document.getElementById("genreChart")
    if (!genreChart) {
        console.warn("Contenedor para genre chart no encontrado.")
        return
    }

    genreChart.innerHTML = ""

    const maxCount = Math.max(...Object.values(genreCount))

    Object.entries(genreCount).forEach(([genreName, count]) => {
        const barContainer = document.createElement("div")
        barContainer.className = "genre-bar"

        const genreNameElement = document.createElement("div")
        genreNameElement.className = "genre-name"
        genreNameElement.textContent = genreName

        const barContainerElement = document.createElement("div")
        barContainerElement.className = "genre-bar-container"

        const barFill = document.createElement("div")
        barFill.className = "genre-bar-fill"
        
        const barWidth = (count / maxCount) * 100
        barFill.style.width = `${barWidth}%`

        const countElement = document.createElement("div")
        countElement.className = "genre-count"
        countElement.textContent = count

        barContainerElement.appendChild(barFill)
        barContainer.appendChild(genreNameElement)
        barContainer.appendChild(barContainerElement)
        barContainer.appendChild(countElement)

        genreChart.appendChild(barContainer)
    })
}

// Función para mostrar notificaciones personalizadas 
function showNotification(message, type = "info") {
    const notification = document.getElementById("customNotification")
    const notificationIcon = notification.querySelector(".notification-icon")
    const notificationText = notification.querySelector(".notification-text")

    if (!notification || !notificationIcon || !notificationText) {
        console.warn("Elementos de notificación no encontrados.")
        return
    }

    // Configurar icono según el tipo
    let iconClass = "fas fa-info-circle"
    let borderColor = "#e50914"

    switch (type) {
        case "success":
            iconClass = "fas fa-check-circle"
            borderColor = "#28a745"
            break
        case "error":
            iconClass = "fas fa-exclamation-triangle"
            borderColor = "#dc3545"
            break
        case "info":
        default:
            iconClass = "fas fa-info-circle"
            borderColor = "#17a2b8"
            break
    }

    notificationIcon.className = `notification-icon ${iconClass}`
    notificationText.textContent = message
    notification.style.borderLeftColor = borderColor

    notification.classList.add("show")

    setTimeout(() => {
        notification.classList.remove("show")
    }, 3000)
}

// Toggle de tema (claro/oscuro)
function setupThemeToggle() {
    themeToggleItems.forEach((item) => {
        item.classList.toggle("active")
    })
    if (toggleBall) toggleBall.classList.toggle("active")

    // Actualizar colores de las gráficas si están visibles
    if (movieModal && movieModal.style.display === "block") {
        const ratingCircle = document.querySelector(".rating-circle")
        if (ratingCircle) {
            ratingCircle.classList.toggle("active")
        }
    }

    if (statsModal && statsModal.style.display === "block") {
        const genreNames = document.querySelectorAll(".genre-name")
        const genreCounts = document.querySelectorAll(".genre-count")

        genreNames.forEach((name) => name.classList.toggle("active"))
        genreCounts.forEach((count) => count.classList.toggle("active"))
    }
}

// Función para cargar más películas cuando se necesiten
async function loadMoreMovies() {
    if (isLoadingMore || !hasMorePages) return

    console.log("Cargando más películas...")
    const nextPage = currentPage + 1
    await loadMoviesByCategory(currentCategory, nextPage, true)
}
