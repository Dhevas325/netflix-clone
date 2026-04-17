import React, { useState, useEffect } from 'react';
import axios from './axios';
import requests from './requests';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectList } from './features/listSlice';
import { selectUser } from './features/userSlice';
import { motion } from 'framer-motion';
import { db } from './firebase';
import { doc, setDoc } from "firebase/firestore";

function Banner() {
    const [movie, setMovie] = useState([]);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const myList = useSelector(selectList);
    
    // Check if the current banner movie is in the user's list
    const inList = movie && myList.find(item => item.id === movie.id);

    const type = movie?.first_air_date ? 'tv' : 'movie';

    useEffect(() => {
        async function fetchData() {
            try {
                const request = await axios.get(requests.fetchNetflixOriginals);
                setMovie(
                    request.data.results[
                        Math.floor(Math.random() * request.data.results.length - 1)
                    ]
                );
                return request;
            } catch (error) {
                console.error("Error fetching banner data:", error);
            }
        }
        fetchData();
    }, []);

    function truncate(string, n) {
        return string?.length > n ? string.substr(0, n - 1) + '...' : string;
    }

    const handleListToggle = async () => {
        if (!user || user.uid === 'guest') {
            alert("Please sign in to save movies to your list!");
            return;
        }

        const listRef = doc(db, "customers", user.uid, "myList", "list");
        
        const movieItem = { 
            id: movie.id, 
            title: movie.title || movie.name, 
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            media_type: type
        };

        try {
            if (inList) {
                await setDoc(listRef, {
                    items: myList.filter(item => item.id !== movie.id)
                });
            } else {
                await setDoc(listRef, {
                    items: [...myList, movieItem]
                });
            }
        } catch (error) {
            console.error("Error updating watchlist:", error);
        }
    };

    return (
        <motion.header
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="banner"
            style={{
                backgroundSize: "cover",
                backgroundImage: `url("https://image.tmdb.org/t/p/original/${movie?.backdrop_path}")`,
                backgroundPosition: "center center",
            }}
        >
            <div className="banner_contents">
                <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="banner_title"
                >
                    {movie?.title || movie?.name || movie?.original_name}
                </motion.h1>
                <div className="banner_buttons">
                    <button 
                        className="banner_button banner_button_play" 
                        onClick={() => {
                            if (type === 'movie') {
                                navigate(`/play/movie/${movie.id}`);
                            } else {
                                navigate(`/title/tv/${movie.id}`);
                            }
                        }}
                    >
                        Play
                    </button>
                    <button 
                        className="banner_button"
                        onClick={() => navigate(`/title/${type}/${movie?.id}`)}
                    >
                        More Info
                    </button>
                    <button 
                        className={`banner_button ${inList ? 'banner_button_active' : ''}`}
                        onClick={handleListToggle}
                    >
                        {inList ? '✓ My List' : '+ My List'}
                    </button>
                </div>
                <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="banner_description"
                >
                    {truncate(movie?.overview, 150)}
                </motion.h1>
            </div>
            <div className="banner--fadeBottom" />
        </motion.header>
    );
}

export default Banner;
