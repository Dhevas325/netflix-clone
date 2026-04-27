import React, { useState, useEffect } from 'react';
import axios from './axios';
import { useNavigate } from 'react-router-dom';
import './Row.css';
import { IoPlay, IoAdd, IoChevronDown, IoThumbsUpOutline, IoCheckmark, IoCloseOutline } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { addToList, removeFromList, selectList } from './features/listSlice';
import { removeFromHistory } from './features/historySlice';

const base_url = "https://image.tmdb.org/t/p/original/";

function Row({ title, fetchUrl, isLargeRow = false, items = null }) {
    const [movies, setMovies] = useState([]);
    const [hoveredMovie, setHoveredMovie] = useState(null);
    const [trailerId, setTrailerId] = useState(null);

    useEffect(() => {
        if (items) {
            setMovies(items);
            return;
        }
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
    }, [fetchUrl, title, items]);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const myList = useSelector(selectList);

    const handleClick = (movie) => {
        const type = movie.media_type ? movie.media_type : (movie.name || movie.first_air_date ? 'tv' : 'movie');
        
        // If this is from 'Continue Watching' history
        if (title === "Continue Watching") {
            const serverParam = movie.lastServer !== undefined ? `?server=${movie.lastServer}` : '';
            if (type === 'tv' && movie.season && movie.episode) {
                navigate(`/play/tv/${movie.id}/${movie.season}/${movie.episode}${serverParam}`);
            } else {
                navigate(`/play/${type}/${movie.id}${serverParam}`);
            }
        } else {
            navigate(`/title/${type}/${movie.id}`);
        }
    };

    const handleMouseEnter = async (movie) => {
        if (title === "Continue Watching") return; // Disable hover trailer for this row
        
        setHoveredMovie(movie.id);
        const timer = setTimeout(async () => {
             try {
                const mediaType = movie.media_type || (movie.name ? 'tv' : 'movie');
                const res = await axios.get(`/${mediaType}/${movie.id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}`);
                const trailer = res.data.results.find(v => v.site === 'YouTube');
                if (trailer) setTrailerId(trailer.key);
            } catch (e) {
                setTrailerId(null);
            }
        }, 800); // Only load video if user hovers for 0.8s
        return () => clearTimeout(timer);
    };

    const handleMouseLeave = () => {
        setHoveredMovie(null);
        setTrailerId(null);
    };

    return (
        <div className="row">
            <h2>{title}</h2>
            <div className="row_posters">
                {movies.map((movie) => {
                    const showPoster = (isLargeRow && movie.poster_path) || (!isLargeRow && movie.backdrop_path);
                    if (!showPoster) return null;

                    const isHovered = hoveredMovie === movie.id;

                    return (
                        <div 
                            className={`row_poster_container ${isLargeRow ? "row_posterLarge" : ""} ${isHovered ? "hovered" : ""}`}
                            key={movie.id}
                            onMouseEnter={() => handleMouseEnter(movie)}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => handleClick(movie)}
                        >
                            {isHovered && trailerId ? (
                                <div className="row_video_preview">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerId}&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&cc_load_policy=0`}
                                        title="Preview"
                                        frameBorder="0"
                                    />
                                    <div className="row_hover_info">
                                        <div className="hover_buttons">
                                            <IoPlay className="h_btn p" onClick={(e) => {
                                                e.stopPropagation();
                                                const type = movie.media_type || (movie.name ? 'tv' : 'movie');
                                                const serverParam = movie.lastServer !== undefined ? `?server=${movie.lastServer}` : '';
                                                if (type === 'tv' && movie.season && movie.episode) {
                                                    navigate(`/play/tv/${movie.id}/${movie.season}/${movie.episode}${serverParam}`);
                                                } else {
                                                    navigate(`/play/${type}/${movie.id}${serverParam}`);
                                                }
                                            }} />
                                            
                                            {myList.find(item => item.id === movie.id) ? (
                                                <IoCheckmark 
                                                    className="h_btn active" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        dispatch(removeFromList({ id: movie.id }));
                                                    }} 
                                                />
                                            ) : (
                                                <IoAdd 
                                                    className="h_btn" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        dispatch(addToList({
                                                            id: movie.id,
                                                            title: movie.title || movie.name,
                                                            poster_path: movie.poster_path,
                                                            backdrop_path: movie.backdrop_path,
                                                            media_type: movie.media_type || (movie.name ? 'tv' : 'movie')
                                                        }));
                                                    }} 
                                                />
                                            )}
                                            
                                            <IoThumbsUpOutline className="h_btn" />
                                            
                                            {title === "Continue Watching" && (
                                                <IoCloseOutline 
                                                    className="h_btn remove_hist" 
                                                    title="Remove from history"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        dispatch(removeFromHistory(movie.id));
                                                    }} 
                                                />
                                            )}

                                            <IoChevronDown className="h_btn more" onClick={(e) => {
                                                e.stopPropagation();
                                                handleClick(movie);
                                            }} />
                                        </div>
                                        <div className="hover_meta">
                                            <span className="match">98% Match</span>
                                            <span className="rating">UA</span>
                                            <span className="duration">2h 15m</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <img
                                    className="row_poster_img"
                                    src={`${base_url}${isLargeRow ? movie.poster_path : movie.backdrop_path}`}
                                    alt={movie.name || movie.title}
                                />
                            )}

                            {/* New Feature: NEW Badge (Appears on top right) */}
                            {title === "New Releases" && (
                                <div className="row_new_badge">NEW</div>
                            )}

                            {/* Continue Watching Features: Progress Bar and Delete Button */}
                            {title === "Continue Watching" && (
                                <>
                                    <div 
                                        className="row_delete_btn" 
                                        title="Remove from history"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            dispatch(removeFromHistory(movie.id));
                                        }}
                                    >
                                        <IoCloseOutline size={18} />
                                    </div>
                                    <div className="row_progress_bar">
                                        <div className="row_progress_fill" style={{ width: `${Math.floor(Math.random() * 60) + 20}%` }}></div>
                                    </div>
                                </>
                            )}

                            {/* New Feature: Coming Soon Remind Me Button */}
                            {title === "Coming Soon" && (
                                <div className="row_coming_soon">
                                    <span className="row_release_date">{movie.release_date}</span>
                                    <button className="row_remind_btn">🔔 Remind Me</button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Row;
