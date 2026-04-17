import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Nav from './Nav';
import axios from './axios';
import { fetchSearch } from './requests';
import './SearchScreen.css';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function SearchScreen() {
    const query = useQuery().get('q');
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    const base_url = "https://image.tmdb.org/t/p/original/";

    useEffect(() => {
        async function fetchData() {
            if (query) {
                const request = await axios.get(fetchSearch(query));
                setResults(request.data.results);
                return request;
            }
        }
        fetchData();
    }, [query]);

    return (
        <div className="searchScreen">
            <Nav />
            <div className="searchScreen_content">
                <h2>Search Results for "{query}"</h2>
                <div className="searchScreen_grid">
                    {results.map((movie) => (
                        ((movie.media_type === 'movie' || movie.media_type === 'tv' || !movie.media_type) && (movie.poster_path || movie.backdrop_path)) && (
                            <div 
                                className="searchScreen_item" 
                                key={movie.id} 
                                onClick={() => navigate(`/title/${movie.media_type || 'movie'}/${movie.id}`)}
                            >
                                <img
                                    src={`${base_url}${movie.poster_path || movie.backdrop_path}`}
                                    alt={movie.name || movie.title}
                                />
                                <p>{movie.name || movie.title}</p>
                            </div>
                        )
                    ))}
                    {results.length === 0 && <p>No results found.</p>}
                </div>
            </div>
        </div>
    );
}

export default SearchScreen;
