import React, { useState, useEffect } from 'react';
import axios from './axios';
import { useNavigate } from 'react-router-dom';

const base_url = "https://image.tmdb.org/t/p/original/";

function Row({ title, fetchUrl, isLargeRow = false }) {
    const [movies, setMovies] = useState([]);
    const [trailerUrl, setTrailerUrl] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const request = await axios.get(fetchUrl);
                setMovies(request.data.results);
                return request;
            } catch (error) {
                console.error("Error fetching data for", title, error);
            }
        }
        fetchData();
    }, [fetchUrl, title]);

    const navigate = useNavigate();

    const handleClick = (movie) => {
        // More robust type detection: TV shows usually have 'name' and 'first_air_date', movies have 'title' and 'release_date'
        const type = movie.media_type ? movie.media_type : (movie.name || movie.first_air_date ? 'tv' : 'movie');
        navigate(`/title/${type}/${movie.id}`);
    };

    return (
        <div className="row">
            <h2>{title}</h2>
            <div className="row_posters">
                {movies.map(
                    (movie) =>
                        ((isLargeRow && movie.poster_path) ||
                        (!isLargeRow && movie.backdrop_path)) && (
                            <img
                                onClick={() => handleClick(movie)}
                                className={`row_poster ${isLargeRow && "row_posterLarge"}`}
                                key={movie.id}
                                src={`${base_url}${
                                    isLargeRow ? movie.poster_path : movie.backdrop_path
                                }`}
                                alt={movie.name || movie.title}
                            />
                        )
                )}
            </div>
        </div>
    );
}

export default Row;
