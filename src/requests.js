const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Netflix India — TMDB API REQUIRES watch_region for watch_providers to work!
const NETFLIX_FILTER = "&with_watch_providers=8&watch_region=IN";
const KIDS_FILTER    = "&certification_country=IN&certification.lte=U&with_genres=10751,16";

const today         = new Date().toISOString().split('T')[0];
const in60Days      = new Date(Date.now() + 60  * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const in2Years      = new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const requests = {
    // 100% REAL-TIME NETFLIX (NO FILTERS, NO CENSORSHIP)
    fetchTrending:        (isKids) => `/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,
    fetchTop10Movies:     (isKids) => `/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,
    fetchTop10Series:     (isKids) => `/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,
    fetchNetflixOriginals:(isKids) => `/discover/tv?api_key=${API_KEY}&with_networks=213${isKids ? KIDS_FILTER : ''}`,
    
    // Auto-syncs with the newest Netflix releases
    fetchRecentlyAdded:   (isKids) => `/discover/movie?api_key=${API_KEY}&sort_by=primary_release_date.desc&primary_release_date.lte=${today}${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,
    fetchNewNetflixSeries: (isKids) => `/discover/tv?api_key=${API_KEY}&sort_by=first_air_date.desc&first_air_date.lte=${today}${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,

    fetchTopRated:        (isKids) => `/discover/movie?api_key=${API_KEY}&sort_by=vote_average.desc&vote_count.gte=1000${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,

    fetchActionMovies:    (isKids) => `/discover/movie?api_key=${API_KEY}&with_genres=28${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,
    fetchComedyMovies:    (isKids) => `/discover/movie?api_key=${API_KEY}&with_genres=35${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,
    fetchHorrorMovies:    (isKids) => `/discover/movie?api_key=${API_KEY}&with_genres=27${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,
    fetchDocumentaries:   (isKids) => `/discover/movie?api_key=${API_KEY}&with_genres=99${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,
    fetchTamilMovies:     (isKids) => `/discover/movie?api_key=${API_KEY}&with_original_language=ta&sort_by=primary_release_date.desc&primary_release_date.lte=${in2Years}${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,
    fetchHindiMovies:     (isKids) => `/discover/movie?api_key=${API_KEY}&with_original_language=hi&sort_by=primary_release_date.desc&primary_release_date.lte=${in2Years}${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,
    fetchTeluguMovies:    (isKids) => `/discover/movie?api_key=${API_KEY}&with_original_language=te&sort_by=primary_release_date.desc&primary_release_date.lte=${in2Years}${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,
    fetchMalayalamMovies: (isKids) => `/discover/movie?api_key=${API_KEY}&with_original_language=ml&sort_by=primary_release_date.desc&primary_release_date.lte=${in2Years}${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,
    fetchKannadaMovies:   (isKids) => `/discover/movie?api_key=${API_KEY}&with_original_language=kn&sort_by=primary_release_date.desc&primary_release_date.lte=${in2Years}${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,

    // Regional Series — Netflix globally, sorted by newest first
    fetchTamilSeries:     (isKids) => `/discover/tv?api_key=${API_KEY}&with_original_language=ta&sort_by=first_air_date.desc&first_air_date.lte=${in2Years}${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,
    fetchHindiSeries:     (isKids) => `/discover/tv?api_key=${API_KEY}&with_original_language=hi&sort_by=first_air_date.desc&first_air_date.lte=${in2Years}${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,
    fetchTeluguSeries:    (isKids) => `/discover/tv?api_key=${API_KEY}&with_original_language=te&sort_by=first_air_date.desc&first_air_date.lte=${in2Years}${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,
    fetchMalayalamSeries: (isKids) => `/discover/tv?api_key=${API_KEY}&with_original_language=ml&sort_by=first_air_date.desc&first_air_date.lte=${in2Years}${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,
    fetchKannadaSeries:   (isKids) => `/discover/tv?api_key=${API_KEY}&with_original_language=kn&sort_by=first_air_date.desc&first_air_date.lte=${in2Years}${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,


    // Coming Soon: Strictly Netflix upcoming releases only
    fetchComingSoon:      (isKids) => `/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&primary_release_date.gte=${today}&primary_release_date.lte=${in60Days}${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,

    // Mood-based — all Netflix filtered
    fetchMoodMusical:  (isKids) => `/discover/movie?api_key=${API_KEY}&with_genres=10402,10751&sort_by=popularity.desc${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,
    fetchMoodScared:   (isKids) => `/discover/movie?api_key=${API_KEY}&with_genres=27,53&sort_by=popularity.desc${NETFLIX_FILTER}${isKids ? KIDS_FILTER : ''}`,
};

export const fetchSearch = (query, isKids) => `/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1&include_adult=false${isKids ? KIDS_FILTER : ''}`;
export const fetchDetails = (type, id) => `/${type}/${id}?api_key=${API_KEY}&language=en-US`;
export const fetchSeason  = (id, seasonNumber) => `/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}&language=en-US`;

export default requests;
