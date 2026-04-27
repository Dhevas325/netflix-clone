import React, { useState, useEffect } from 'react';
import axios from './axios';
import { useNavigate } from 'react-router-dom';
import './Row.css';

const base_url = "https://image.tmdb.org/t/p/original/";

function CustomSearchRow({ title, queries, isLargeRow = false }) {
    const [movies, setMovies] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchMovies() {
            try {
                const fetchedMovies = [];
                for (const query of queries) {
                    // Search for the specific title
                    const request = await axios.get(
                        `/search/multi?api_key=${import.meta.env.VITE_TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`
                    );
                    
                    if (request.data.results && request.data.results.length > 0) {
                        // Get the best match (first one that has a poster)
                        const match = request.data.results.find(m => m.poster_path || m.backdrop_path);
                        if (match && !fetchedMovies.find(m => m.id === match.id)) {
                            fetchedMovies.push(match);
                        }
                    }
                }
                setMovies(fetchedMovies);
            } catch (error) {
                console.error("Error fetching custom titles:", error);
            }
        }
        fetchMovies();
    }, [queries]);

    const handleClick = (movie) => {
        const type = movie.media_type ? movie.media_type : (movie.name || movie.first_air_date ? 'tv' : 'movie');
        navigate(`/title/${type}/${movie.id}`);
    };

    return (
        <div className="row">
            <h2>{title}</h2>
            <div className="row_posters">
                {movies.map((movie) => (
                    ((isLargeRow && movie.poster_path) ||
                    (!isLargeRow && movie.backdrop_path)) && (
                        <img
                            key={movie.id}
                            onClick={() => handleClick(movie)}
                            className={`row_poster ${isLargeRow && "row_posterLarge"}`}
                            src={`${base_url}${
                                isLargeRow ? movie.poster_path : movie.backdrop_path
                            }`}
                            alt={movie.name || movie.title}
                        />
                    )
                ))}
            </div>
        </div>
    );
}

export default CustomSearchRow;
