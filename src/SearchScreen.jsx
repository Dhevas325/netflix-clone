import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectActiveProfile } from './features/userSlice';
import Nav from './Nav';
import axios from './axios';
import { fetchSearch } from './requests';
import './SearchScreen.css';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const GENRES = [
    { id: '', name: 'All' },
    { id: 28, name: 'Action' },
    { id: 35, name: 'Comedy' },
    { id: 27, name: 'Horror' },
    { id: 10749, name: 'Romance' },
    { id: 18, name: 'Drama' },
    { id: 878, name: 'Sci-Fi' },
    { id: 99, name: 'Documentary' },
    { id: 16, name: 'Animation' },
];

function SearchScreen() {
    const query = useQuery().get('q');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [genreFilter, setGenreFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');
    const [mediaType, setMediaType] = useState('all');
    const activeProfile = useSelector(selectActiveProfile);
    const isKids = activeProfile?.isKids;
    const navigate = useNavigate();
    const base_url = "https://image.tmdb.org/t/p/w500";
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

    useEffect(() => {
        async function fetchData() {
            if (!query) return;
            setLoading(true);
            try {
                const request = await axios.get(fetchSearch(query, isKids));
                setResults(request.data.results || []);
            } catch (e) {
                console.error("Search failed", e);
            } finally {
                setLoading(false);
            }
        }
        const timer = setTimeout(fetchData, 300); // Debounce
        return () => clearTimeout(timer);
    }, [query]);

    // Genre browse (when no query)
    useEffect(() => {
        async function fetchByGenre() {
            if (query || !genreFilter) return;
            setLoading(true);
            try {
                const res = await axios.get(
                    `/discover/movie?api_key=${API_KEY}&with_genres=${genreFilter}&sort_by=popularity.desc&with_watch_providers=8&watch_region=IN${isKids ? '&certification_country=IN&certification.lte=U&with_genres=10751,16' : ''}`
                );
                setResults(res.data.results || []);
            } catch (e) {
                console.error("Genre fetch failed", e);
            } finally {
                setLoading(false);
            }
        }
        fetchByGenre();
    }, [genreFilter, API_KEY, query]);

    // Apply client-side filters
    let filtered = results.filter(m => {
        const isCorrectType = mediaType === 'all'
            ? (m.media_type !== 'person')
            : m.media_type === mediaType || !m.media_type;
        const hasImage = m.poster_path || m.backdrop_path;
        const matchYear = !yearFilter || 
            (m.release_date || m.first_air_date || '').startsWith(yearFilter);
        const matchRating = !ratingFilter || 
            (m.vote_average >= Number(ratingFilter));
        return isCorrectType && hasImage && matchYear && matchRating;
    });

    return (
        <div className="searchScreen">
            <Nav />
            <div className="searchScreen_content">
                <h2>{query ? `Results for "${query}"` : 'Browse by Genre'}</h2>

                {/* Advanced Filter Bar */}
                <div className="searchScreen_filters">
                    <select value={mediaType} onChange={e => setMediaType(e.target.value)}>
                        <option value="all">All</option>
                        <option value="movie">Movies</option>
                        <option value="tv">TV Shows</option>
                    </select>

                    <select value={genreFilter} onChange={e => setGenreFilter(e.target.value)}>
                        {GENRES.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>

                    <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                        <option value="">Any Year</option>
                        {Array.from({ length: 30 }, (_, i) => 2025 - i).map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>

                    <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
                        <option value="">Any Rating</option>
                        <option value="9">9+ ⭐</option>
                        <option value="8">8+ ⭐</option>
                        <option value="7">7+ ⭐</option>
                        <option value="6">6+ ⭐</option>
                    </select>
                </div>

                {loading && <div className="searchScreen_loading">Searching...</div>}

                <div className="searchScreen_grid">
                    {filtered.map((movie) => (
                        <div
                            className="searchScreen_item"
                            key={movie.id}
                            onClick={() => navigate(`/title/${movie.media_type || 'movie'}/${movie.id}`)}
                        >
                            <img
                                src={`${base_url}${movie.poster_path || movie.backdrop_path}`}
                                alt={movie.name || movie.title}
                                loading="lazy"
                            />
                            <div className="searchScreen_item_info">
                                <p>{movie.name || movie.title}</p>
                                <span className="searchScreen_rating">⭐ {movie.vote_average?.toFixed(1)}</span>
                                <span className="searchScreen_year">
                                    {(movie.release_date || movie.first_air_date || '').substring(0, 4)}
                                </span>
                            </div>
                        </div>
                    ))}
                    {!loading && filtered.length === 0 && (
                        <p className="searchScreen_empty">No results found. Try a different filter or search term.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SearchScreen;
