import React, { useState, useEffect } from 'react';
import axios from './axios';
import { useNavigate } from 'react-router-dom';
import './Top10Row.css';

const base_url = "https://image.tmdb.org/t/p/original/";

function Top10Row({ title, fetchUrl }) {
    const [movies, setMovies] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                const request = await axios.get(fetchUrl);
                // Only take the first 10
                setMovies(request.data.results.slice(0, 10));
                return request;
            } catch (error) {
                console.error("Error fetching Top 10 data:", error);
            }
        }
        fetchData();
    }, [fetchUrl]);

    const handleClick = (movie) => {
        const type = movie.media_type ? movie.media_type : (movie.name || movie.first_air_date ? 'tv' : 'movie');
        navigate(`/title/${type}/${movie.id}`);
    };

    return (
        <div className="top10Row">
            <h2>{title}</h2>
            <div className="top10_posters">
                {movies.map((movie, index) => (
                    <div 
                        className="top10_item" 
                        key={movie.id}
                        onClick={() => navigate(`/title/${movie.media_type || 'movie'}/${movie.id}`)}
                    >
                        <div className="top10_rank">
                            <svg viewBox="0 0 100 100" className="rank_number">
                                <text 
                                    x="50%" 
                                    y="95%" 
                                    textAnchor="middle" 
                                    className="rank_text"
                                >
                                    {index + 1}
                                </text>
                            </svg>
                        </div>
                        <img
                            className="top10_poster"
                            src={`${base_url}${movie.poster_path}`}
                            alt={movie.name || movie.title}
                        />
                        <div className="top10_badge">
                            <div className="top10_badge_text">TOP</div>
                            <div className="top10_badge_number">10</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Top10Row;
