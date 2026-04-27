import React, { useState, useEffect } from 'react';
import axios from './axios';
import requests from './requests';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectList, addToList, removeFromList } from './features/listSlice';
import { selectUser, selectActiveProfile } from './features/userSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from './firebase';
import { doc, setDoc } from "firebase/firestore";
import { IoPlaySharp, IoInformationCircleOutline } from 'react-icons/io5';
import movieTrailer from 'movie-trailer';
import './Banner.css';

function Banner() {
    const [movie, setMovie] = useState(null);
    const [trailerId, setTrailerId] = useState(null);
    const [showVideo, setShowVideo] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const myList = useSelector(selectList);
    const activeProfile = useSelector(selectActiveProfile);
    
    const inList = movie && myList.find(item => item.id === movie.id);
    const type = movie?.first_air_date ? 'tv' : 'movie';

    useEffect(() => {
        async function fetchData() {
            try {
                // Try fetching recently added or new series
                const primaryUrl = Math.random() > 0.5 
                    ? requests.fetchRecentlyAdded(activeProfile?.isKids) 
                    : requests.fetchNewNetflixSeries(activeProfile?.isKids);
                    
                let response = await axios.get(primaryUrl);
                let results = response.data.results || [];
                
                // Fallback to Trending if primary results are empty
                if (results.length === 0) {
                    response = await axios.get(requests.fetchTrending(activeProfile?.isKids));
                    results = response.data.results || [];
                }

                if (results.length > 0) {
                    const picked = results[Math.floor(Math.random() * results.length)];
                    setMovie(picked);
                    setTrailerId(null);
                    setShowVideo(false);
                }
            } catch (error) {
                console.error("Error fetching banner data:", error);
            }
        }
        fetchData();
    }, [activeProfile]);

    // Auto-fetch trailer for banner background video
    useEffect(() => {
        if (!movie?.id) return;
        const timer = setTimeout(async () => {
            try {
                let foundId = null;
                const mediaType = movie?.first_air_date ? 'tv' : 'movie';
                const res = await axios.get(`/${mediaType}/${movie.id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}`);
                const videos = res.data.results || [];
                const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube')
                    || videos.find(v => v.site === 'YouTube');
                
                if (trailer) {
                    foundId = trailer.key;
                }

                // Invidious Fallback (Multi-instance for High Availability)
                if (!foundId) {
                    const title = movie?.title || movie?.name || movie?.original_name || "";
                    const year = (movie?.release_date || movie?.first_air_date || "").substring(0, 4);
                    const query = `${title} ${year} official trailer`;
                    
                    const invidiousInstances = [
                        'https://invidious.privacydev.net',
                        'https://inv.nadeko.net',
                        'https://invidious.no-logs.com',
                        'https://inv.tux.digital',
                        'https://invidious.io',
                        'https://vid.priv.au',
                    ];

                    for (const instance of invidiousInstances) {
                        try {
                            const searchRes = await fetch(`${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video&fields=videoId`, { signal: AbortSignal.timeout(3000) });
                            if (searchRes.ok) {
                                const data = await searchRes.json();
                                if (Array.isArray(data) && data.length > 0 && data[0].videoId) {
                                    foundId = data[0].videoId;
                                    break; // Stop loop if we found the trailer!
                                }
                            }
                        } catch (e) {
                            // If this instance fails, the loop will automatically try the next one
                        }
                    }
                }

                // movie-trailer package Fallback
                if (!foundId) {
                    try {
                        const title = movie?.title || movie?.name || movie?.original_name || "";
                        const url = await movieTrailer(title);
                        if (url) {
                            foundId = url.includes('v=') ? new URL(url).searchParams.get('v') : url.split('/').pop().split('?')[0];
                        }
                    } catch (e) {}
                }

                if (foundId) {
                    setTrailerId(foundId);
                    setShowVideo(true);
                } else {
                    // Working fallback: Netflix Intro
                    setTrailerId('GV3HUDMQ-F8');
                    setShowVideo(true);
                }
            } catch (e) {
                // Network error fallback
                setTrailerId('GV3HUDMQ-F8');
                setShowVideo(true);
            }
        }, 2000); // 2s delay so banner image shows first
        return () => clearTimeout(timer);
    }, [movie]);

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
                await setDoc(listRef, { items: myList.filter(item => item.id !== movie.id) });
            } else {
                await setDoc(listRef, { items: [...myList, movieItem] });
            }
        } catch (error) {
            console.error("Error updating watchlist:", error);
        }
    };

    if (!movie) return <div className="banner_placeholder" style={{height: '85vh', backgroundColor: '#111'}}></div>;

    return (
        <motion.header
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="banner"
            style={{
                backgroundSize: "cover",
                backgroundImage: showVideo ? 'none' : `url("https://image.tmdb.org/t/p/original/${movie?.backdrop_path}")`,
                backgroundPosition: "center center",
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Muted background trailer autoplay */}
            {showVideo && trailerId && (
                <div className="banner_video_wrap">
                    <iframe
                        src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailerId}&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&cc_load_policy=0`}
                        title="Banner Trailer"
                        className="banner_video_iframe"
                        allow="autoplay; encrypted-media"
                        frameBorder="0"
                    />
                    <div className="banner_video_overlay" />
                </div>
            )}
            <div className="banner_contents">
                <div className="banner_metadata">
                    <span className="n_series_badge">N</span>
                    <span className="n_series_text">{movie?.first_air_date ? 'SERIES' : 'FILM'}</span>
                </div>
                
                <h1 className="banner_title">
                    {movie?.title || movie?.name || movie?.original_name}
                </h1>

                <div className="banner_top10">
                    <div className="top10_box">
                        <span className="top10_rank_small">TOP</span>
                        <span className="top10_num_small">10</span>
                    </div>
                    <span className="top10_text">#1 in India Today</span>
                </div>

                <div className="banner_stats">
                    <span className="banner_match">{(movie?.vote_average * 10).toFixed(0)}% Match</span>
                    <span className="banner_year">{movie?.release_date?.substring(0,4) || movie?.first_air_date?.substring(0,4)}</span>
                    <span className="banner_rating">U/A 13+</span>
                    <span className="banner_hd">HD</span>
                </div>

                <p className="banner_description">
                    {truncate(movie?.overview, 150)}
                </p>

                <div className="banner_buttons">
                    <button className="banner_button play" onClick={() => navigate(`/play/${type}/${movie?.id}`)}>
                        <IoPlaySharp size={24} /> Play
                    </button>
                    <button className="banner_button info" onClick={() => navigate(`/title/${type}/${movie?.id}`)}>
                        <IoInformationCircleOutline size={28} /> More Info
                    </button>
                    {showVideo && (
                        <button className="banner_mute_toggle" onClick={() => setIsMuted(!isMuted)}>
                            {isMuted ? '🔇' : '🔊'}
                        </button>
                    )}
                </div>
            </div>
            <div className="banner--fadeBottom" />
        </motion.header>
    );
}

export default Banner;

