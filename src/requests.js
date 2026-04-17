const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const NETFLIX_FILTER = "&with_watch_providers=8&watch_region=IN";
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const requests = {
    fetchTrending: `/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc${NETFLIX_FILTER}`,
    fetchNetflixOriginals: `/discover/tv?api_key=${API_KEY}&with_networks=213`,
    fetchRecentlyAdded: `/discover/movie?api_key=${API_KEY}&sort_by=primary_release_date.desc&primary_release_date.gte=${sevenDaysAgo}${NETFLIX_FILTER}`,
    fetchTopRated: `/movie/top_rated?api_key=${API_KEY}&language=en-US${NETFLIX_FILTER}`,
    fetchActionMovies: `/discover/movie?api_key=${API_KEY}&with_genres=28${NETFLIX_FILTER}`,
    fetchComedyMovies: `/discover/movie?api_key=${API_KEY}&with_genres=35${NETFLIX_FILTER}`,
    fetchHorrorMovies: `/discover/movie?api_key=${API_KEY}&with_genres=27${NETFLIX_FILTER}`,
    fetchRomanceMovies: `/discover/movie?api_key=${API_KEY}&with_genres=10749${NETFLIX_FILTER}`,
    fetchDocumentaries: `/discover/movie?api_key=${API_KEY}&with_genres=99${NETFLIX_FILTER}`,
    fetchTamilMovies: `/discover/movie?api_key=${API_KEY}&with_original_language=ta${NETFLIX_FILTER}`,
    fetchHindiMovies: `/discover/movie?api_key=${API_KEY}&with_original_language=hi${NETFLIX_FILTER}`,
};

export const fetchSearch = (query) => `/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1&include_adult=true&region=IN`;
export const fetchDetails = (type, id) => `/${type}/${id}?api_key=${API_KEY}&language=en-US`;
export const fetchSeason = (id, seasonNumber) => `/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}&language=en-US`;

export default requests;
