import React, { useState, useEffect } from 'react';
import axios from './axios';
import { useNavigate } from 'react-router-dom';
import './MoodRow.css';

const base_url = "https://image.tmdb.org/t/p/original/";

const moods = [
    { name: 'Happy', emoji: '😄', genre: 35 }, // Comedy
    { name: 'Thrilled', emoji: '⚡', genre: 28 }, // Action
    { name: 'Sad', emoji: '😢', genre: 18 }, // Drama
    { name: 'Romantic', emoji: '❤️', genre: 10749 }, // Romance
    { name: 'Scared', emoji: '😱', genre: 27 }, // Horror
];

function MoodRow() {
    const [selectedMood, setSelectedMood] = useState(moods[0]);
    const [movies, setMovies] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            const fetchUrl = `/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&with_genres=${selectedMood.genre}`;
            const request = await axios.get(fetchUrl);
            setMovies(request.data.results);
            return request;
        }
        fetchData();
    }, [selectedMood]);

    return (
        <div className="moodRow">
            <div className="moodRow_header">
                <h2>What's your mood?</h2>
                <div className="mood_selectors">
                    {moods.map((mood) => (
                        <button 
                            key={mood.name}
                            className={`mood_btn ${selectedMood.name === mood.name ? 'active' : ''}`}
                            onClick={() => setSelectedMood(mood)}
                        >
                            {mood.emoji} {mood.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="moodRow_posters">
                {movies.map((movie) => (
                    <img
                        key={movie.id}
                        onClick={() => navigate(`/title/movie/${movie.id}`)}
                        className="mood_poster"
                        src={`${base_url}${movie.backdrop_path}`}
                        alt={movie.name}
                    />
                ))}
            </div>
        </div>
    );
}

export default MoodRow;
