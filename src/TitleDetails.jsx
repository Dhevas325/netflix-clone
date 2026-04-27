import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from './axios';
import { fetchDetails, fetchSeason } from './requests';
import Nav from './Nav';
import Row from './Row';
import './TitleDetails.css';
import { IoPlaySharp, IoAddSharp, IoCheckmarkSharp } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { selectList, addToList, removeFromList } from './features/listSlice';
import { selectUser } from './features/userSlice';
import { db } from './firebase';
import { doc, setDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import YouTube from 'react-youtube';
import movieTrailer from 'movie-trailer';
import { IoCloseSharp, IoThumbsUpOutline, IoThumbsUpSharp, IoThumbsDownOutline, IoThumbsDownSharp } from 'react-icons/io5';
import { BsHeart, BsHeartFill } from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';

function TitleDetails() {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const myList = useSelector(selectList);
    const inList = myList.find(item => item.id === Number(id));

    const [movie, setMovie] = useState({});
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [episodes, setEpisodes] = useState([]);
    const [trailerUrl, setTrailerUrl] = useState("");
    const [showTrailer, setShowTrailer] = useState(false);
    const [trailerError, setTrailerError] = useState(false);
    const [videoList, setVideoList] = useState([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isTrailerLoading, setIsTrailerLoading] = useState(false);
    
    // Premium Netflix Features
    const [rating, setRating] = useState(null); // 'like', 'dislike', 'love'
    const [cast, setCast] = useState([]);
    const [showHearts, setShowHearts] = useState(false);

    const base_url = "https://image.tmdb.org/t/p/original/";

    useEffect(() => {
        async function fetchMovieData() {
            try {
                const request = await axios.get(`/${type}/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&append_to_response=videos,credits`);
                setMovie(request.data);
                
                if (request.data.credits?.cast) {
                    const validCast = request.data.credits.cast.filter(actor => actor.profile_path);
                    setCast(validCast.slice(0, 10)); // Top 10 cast members with photos
                }

                if (type === 'tv' && request.data.seasons) {
                    const actualSeasons = request.data.seasons.filter(s => s.season_number > 0);
                    setSeasons(actualSeasons);
                    if (actualSeasons.length > 0) {
                        setSelectedSeason(actualSeasons[0].season_number);
                    }
                }
            } catch (error) {
                console.error("Error fetching movie details:", error);
            }
        }
        fetchMovieData();
    }, [type, id]);

    // Trailer will now only play when the user clicks the 'Trailer' button.

    // Auto-open trailer modal when movie data is loaded
    useEffect(() => {
        if (movie?.id) {
            handleTrailer();
        }
    }, [movie?.id]);

    useEffect(() => {
        async function fetchSeasonData() {
            if (type === 'tv' && selectedSeason !== null) {
                try {
                    const request = await axios.get(fetchSeason(id, selectedSeason));
                    setEpisodes(request.data.episodes || []);
                } catch (error) {
                    console.log(error);
                }
            }
        }
        fetchSeasonData();
    }, [type, id, selectedSeason]);

    const handlePlayMovie = () => {
        navigate(`/play/${type}/${id}`);
    };

    const handlePlayEpisode = (seasonNum, episodeNum) => {
        navigate(`/play/tv/${id}/${seasonNum}/${episodeNum}`);
    };

    function truncate(string, n) {
        return string?.length > n ? string.substr(0, n - 1) + '...' : string;
    }

    function extractYouTubeId(input) {
        if (!input) return null;
        const trimmed = input.trim();
        // Plain 11-char video ID
        if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
        try {
            const url = new URL(trimmed);
            // youtu.be/VIDEO_ID
            if (url.hostname === 'youtu.be') return url.pathname.slice(1);
            // youtube.com/watch?v=VIDEO_ID
            if (url.searchParams.get('v')) return url.searchParams.get('v');
            // youtube.com/embed/VIDEO_ID
            const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
            if (embedMatch) return embedMatch[1];
        } catch (_) {}
        // Regex fallback
        const match = trimmed.match(/[a-zA-Z0-9_-]{11}/);
        return match ? match[0] : null;
    }

    const handleListToggle = async () => {
        const movieItem = { 
            id: movie.id, 
            title: movie.title || movie.name, 
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            media_type: type
        };

        if (inList) {
            dispatch(removeFromList({ id: movie.id }));
        } else {
            dispatch(addToList(movieItem));
        }

        if (user && user.uid !== 'guest') {
            const listRef = doc(db, "customers", user.uid, "myList", "list");
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
        }
    };

    const handleTrailer = async () => {
        setTrailerError(false);
        if (trailerUrl) {
            setShowTrailer(true);
            return;
        }

        setShowTrailer(true);
        setIsTrailerLoading(true);

        try {
            const title = movie?.title || movie?.name || movie?.original_name || "";
            const originalTitle = movie?.original_title || movie?.original_name || "";
            const year = (movie?.release_date || movie?.first_air_date || "").substring(0, 4);
            const originalLang = movie?.original_language;
            const langMap = { ta: 'Tamil', hi: 'Hindi', te: 'Telugu', ml: 'Malayalam', kn: 'Kannada', mr: 'Marathi' };
            const langName = langMap[originalLang] || "";
            const director = movie?.credits?.crew?.find(p => p.job === 'Director')?.name || "";
            const mainActor = movie?.credits?.cast?.[0]?.name || "";

            console.log(`[Trailer] Searching for: "${title}" (${year}, ${langName || originalLang})`);

            // ── STEP 1: TMDB pre-loaded videos ──────────────────────────────────
            let videos = movie?.videos?.results || [];

            // ── STEP 2: TMDB direct fetch with original language ─────────────────
            if (videos.length === 0) {
                const langParam = originalLang ? `&language=${originalLang}` : '';
                const res = await axios.get(`/${type}/${id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}${langParam}`);
                videos = res.data.results || [];
            }

            // ── STEP 3: TMDB fetch in English if still empty ──────────────────────
            if (videos.length === 0) {
                const res = await axios.get(`/${type}/${id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`);
                videos = res.data.results || [];
            }

            // Sort: prefer trailer in original language
            const sortedVideos = [...videos].sort((a, b) => {
                const aOk = a.type === 'Trailer' && a.iso_639_1 === originalLang;
                const bOk = b.type === 'Trailer' && b.iso_639_1 === originalLang;
                if (aOk && !bOk) return -1;
                if (bOk && !aOk) return 1;
                if (a.type === 'Trailer' && b.type !== 'Trailer') return -1;
                if (b.type === 'Trailer' && a.type !== 'Trailer') return 1;
                return 0;
            });

            setVideoList(sortedVideos);
            setCurrentVideoIndex(0);

            if (sortedVideos.length > 0) {
                console.log("[Trailer] TMDB found:", sortedVideos[0].key);
                setTrailerUrl(sortedVideos[0].key);
                setIsTrailerLoading(false);
                return;
            }

            // ── STEP 4: Invidious API (free YouTube search, no key needed) ────────
            console.log("[Trailer] TMDB empty. Trying Invidious YouTube search...");

            const searchQueries = [
                langName ? `${langName} ${title} ${year} official trailer` : null,
                director   ? `${title} ${director} ${year} trailer` : null,
                mainActor  ? `${title} ${mainActor} trailer` : null,
                `${title} ${year} official trailer`,
                `${originalTitle} official trailer`,
                `${title} trailer`,
            ].filter(Boolean);

            // Public Invidious instances (CORS-friendly fallback)
            const invidiousInstances = [
                'https://invidious.privacydev.net',
                'https://inv.nadeko.net',
                'https://invidious.no-logs.com',
                'https://inv.tux.digital',
                'https://invidious.io',
                'https://vid.priv.au',
            ];

            let foundVideoId = null;

            outer: for (const query of searchQueries) {
                for (const instance of invidiousInstances) {
                    try {
                        console.log(`[Trailer] Invidious search: "${query}" on ${instance}`);
                        const res = await fetch(
                            `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video&fields=videoId,title`,
                            { signal: AbortSignal.timeout(4000) }
                        );
                        if (!res.ok) continue;
                        const data = await res.json();
                        if (Array.isArray(data) && data.length > 0 && data[0].videoId) {
                            foundVideoId = data[0].videoId;
                            console.log(`[Trailer] Invidious found: ${foundVideoId} — "${data[0].title}"`);
                            break outer;
                        }
                    } catch (e) {
                        console.warn(`[Trailer] Invidious instance failed: ${instance}`, e.message);
                        continue;
                    }
                }
            }

            // ── STEP 5: movie-trailer package as last resort ──────────────────────
            if (!foundVideoId) {
                console.log("[Trailer] Trying movie-trailer package...");
                for (const query of searchQueries.slice(0, 3)) {
                    try {
                        const url = await movieTrailer(query);
                        if (url) {
                            foundVideoId = url.includes('v=')
                                ? new URL(url).searchParams.get('v')
                                : url.split('/').pop().split('?')[0];
                            if (foundVideoId) {
                                console.log(`[Trailer] movie-trailer found: ${foundVideoId}`);
                                break;
                            }
                        }
                    } catch (e) { continue; }
                }
            }

            if (foundVideoId) {
                setTrailerUrl(foundVideoId);
            } else {
                console.warn("[Trailer] All sources exhausted — no trailer found.");
                setTrailerError(true);
            }
        } catch (error) {
            console.error("[Trailer] Fatal error:", error);
            setTrailerError(true);
        } finally {
            setIsTrailerLoading(false);
        }
    };

    const handleManualSearch = async (customQuery) => {
        if (!customQuery) return;
        setIsTrailerLoading(true);
        setTrailerError(false);
        try {
            // Try the first reliable Invidious instance
            const instance = 'https://invidious.privacydev.net';
            const res = await fetch(
                `${instance}/api/v1/search?q=${encodeURIComponent(customQuery)}&type=video&fields=videoId`,
                { signal: AbortSignal.timeout(6000) }
            );
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setTrailerUrl(data[0].videoId);
            } else {
                setTrailerError(true);
            }
        } catch (e) {
            console.error("Manual search failed", e);
            setTrailerError(true);
        } finally {
            setIsTrailerLoading(false);
        }
    };


    const handleVideoError = () => {
        console.log("Video blocked or error. Trying next available video...");
        const nextIndex = currentVideoIndex + 1;
        if (nextIndex < videoList.length) {
            setCurrentVideoIndex(nextIndex);
            setTrailerUrl(videoList[nextIndex].key);
        } else {
            console.log("No more videos in the list.");
            setTrailerError(true);
        }
    };

    const opts = {
        height: '390',
        width: '100%',
        playerVars: {
            autoplay: 1,
            origin: window.location.origin
        },
    };
    const handleLoveClick = () => {
        const newRating = rating === 'love' ? null : 'love';
        setRating(newRating);
        if (newRating === 'love') {
            setShowHearts(true);
            setTimeout(() => setShowHearts(false), 2000);
        }
    };

    return (
        <div className="titleDetails">
            <Nav />
            <AnimatePresence>
                {showHearts && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hearts_burst_overlay"
                    >
                        {Array.from({ length: 20 }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: 0, x: 0, opacity: 1, scale: 0.5 }}
                                animate={{ 
                                    y: -300 - Math.random() * 300, 
                                    x: (Math.random() - 0.5) * 400,
                                    opacity: 0,
                                    scale: 1.5,
                                    rotate: Math.random() * 360
                                }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="burst_heart"
                            >
                                <BsHeartFill color="#e50914" size={30} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            <div 
                className="titleDetails_banner"
                style={{
                    backgroundSize: "cover",
                    backgroundPosition: "center center",
                    backgroundImage: `url("${base_url}${movie?.backdrop_path || movie?.poster_path}")`,
                }}
            >
                <div className="titleDetails_banner_fadeTop"></div>
                <div className="titleDetails_content">
                    <h1 className="titleDetails_title">
                        {movie?.title || movie?.name || movie?.original_name}
                    </h1>
                    <div className="titleDetails_info">
                        <span className="match">{(movie?.vote_average * 10).toFixed(0)}% Match</span>
                        <span>{movie?.release_date?.substring(0,4) || movie?.first_air_date?.substring(0,4)}</span>
                        {type === 'tv' && <span>{movie?.number_of_seasons} Seasons</span>}
                        <span className="hd">HD</span>
                    </div>
                    <div className="titleDetails_buttons">
                        {type === 'movie' && (
                            <button className="titleDetails_playButton" onClick={handlePlayMovie}>
                                <IoPlaySharp size={24} /> <span>Play</span>
                            </button>
                        )}
                        <button className="titleDetails_trailerButton" onClick={handleTrailer}>
                            <IoPlaySharp size={24} /> <span>Trailer</span>
                        </button>
                        <button className="titleDetails_listButton" onClick={handleListToggle}>
                            {inList ? <IoCheckmarkSharp size={24} /> : <IoAddSharp size={24} />}
                            <span>My List</span>
                        </button>
                        <button 
                            className="titleDetails_partyButton" 
                            onClick={() => navigate(`/watch-party/${type}/${id}`)}
                            title="Watch with friends"
                        >
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M402 168c-2.93 0-5.67.58-8.22 1.59a120.39 120.39 0 01-190.56 0c-2.55-1-5.29-1.59-8.22-1.59-35.35 0-64 28.65-64 64 0 22.1 11.31 41.51 28.34 53 10.37 7 15.66 12.82 15.66 23v5.66c0 10.29-13.84 21.6-43.05 41.54C91.13 384.71 64 414.7 64 448v16h160v-16c0-32.92-26-63.15-66.51-90.17-5.1-3.41-8.5-6.55-11.49-10.83-3.23-4.63-4.54-9.06-4-13.11a36.42 36.42 0 0110.88-23.77 11.83 11.83 0 015.68-3.08l4.47-.94a11.91 11.91 0 0110.35 4.31c15.22 19.38 38.64 30.59 63.62 30.59s48.4-11.21 63.62-30.59a11.91 11.91 0 0110.35-4.31l4.47.94a11.83 11.83 0 015.68 3.08 36.42 36.42 0 0110.88 23.77c.54 4.05-.77 8.48-4 13.11-3 4.28-6.39 7.42-11.49 10.83C314 384.85 288 415.08 288 448v16h160v-16c0-33.3-27.13-63.29-67.95-91.26-29.21-19.94-43.05-31.25-43.05-41.54V309c0-10.18 5.29-16 15.66-23 17.03-11.49 28.34-30.9 28.34-53 0-35.35-28.65-64-64-64z"></path></svg>
                            <span>Watch Party</span>
                        </button>
                    </div>

                    {/* Premium Netflix Interactive Rating System */}
                    <div className="titleDetails_ratings">
                        <button 
                            className={`rating_btn ${rating === 'dislike' ? 'active' : ''}`}
                            onClick={() => setRating(rating === 'dislike' ? null : 'dislike')}
                            title="Not for me"
                        >
                            {rating === 'dislike' ? <IoThumbsDownSharp size={24} /> : <IoThumbsDownOutline size={24} />}
                        </button>
                        <button 
                            className={`rating_btn ${rating === 'like' ? 'active' : ''}`}
                            onClick={() => setRating(rating === 'like' ? null : 'like')}
                            title="I like this"
                        >
                            {rating === 'like' ? <IoThumbsUpSharp size={24} /> : <IoThumbsUpOutline size={24} />}
                        </button>
                        <button 
                            className={`rating_btn ${rating === 'love' ? 'active' : ''}`}
                            onClick={handleLoveClick}
                            title="Love this!"
                        >
                            {rating === 'love' ? <BsHeartFill size={20} /> : <BsHeart size={20} />}
                        </button>
                    </div>

                    <h2 className="titleDetails_description">
                        {truncate(movie?.overview, 300)}
                    </h2>
                </div>
                <div className="titleDetails_banner_fadeBottom"></div>
            </div>

            {showTrailer && (
                <div className="titleDetails_trailerModal">
                    <div className="trailer_overlay" onClick={() => setShowTrailer(false)}></div>
                    <div className="trailer_content">
                        <button className="trailer_close" onClick={() => setShowTrailer(false)}>
                            <IoCloseSharp size={40} />
                        </button>
                        {isTrailerLoading ? (
                            <div className="trailer_loading">
                                <div className="loader"></div>
                                <p>Searching for best quality trailer...</p>
                            </div>
                        ) : trailerUrl && !trailerError ? (
                            <YouTube 
                                videoId={trailerUrl} 
                                opts={opts} 
                                onError={handleVideoError}
                            />
                        ) : (
                            <div className="trailer_error">
                                <h3>🔍 Trailer not available</h3>
                                <p>We couldn't find an official trailer automatically.</p>
                                
                                <div className="trailer_manualSearch">
                                    <input 
                                        type="text" 
                                        placeholder="Type movie name to search..." 
                                        onKeyDown={(e) => e.key === 'Enter' && handleManualSearch(e.target.value)}
                                        className="manual_search_input"
                                    />
                                    <button onClick={(e) => handleManualSearch(e.target.previousSibling.value)}>
                                        Find Trailer
                                    </button>
                                </div>

                                <div className="trailer_or">OR</div>

                                <button 
                                    className="trailer_searchButton"
                                    onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(movie?.title || movie?.name)} official trailer`, '_blank')}
                                >
                                    🔎 Open in YouTube
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            )}

            <div className="titleDetails_bottom">
                {type === 'tv' && (
                    <div className="titleDetails_episodesSection">
                        <div className="titleDetails_episodesHeader">
                            <h3>Episodes</h3>
                            <select 
                                value={selectedSeason} 
                                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                                className="titleDetails_seasonSelect"
                            >
                                {seasons.map((season) => (
                                    <option key={season.season_number} value={season.season_number}>
                                        Season {season.season_number}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="titleDetails_episodesList">
                            {episodes.map((ep, index) => (
                                <div key={ep.id} className="titleDetails_episode" onClick={() => handlePlayEpisode(selectedSeason, ep.episode_number)}>
                                    <h1 className="episode_number">{index + 1}</h1>
                                    <img 
                                        src={ep.still_path ? `${base_url}${ep.still_path}` : `${base_url}${movie?.backdrop_path}`} 
                                        alt={ep.name} 
                                        className="episode_img"
                                    />
                                    <div className="episode_info">
                                        <div className="episode_infoHeader">
                                            <h4>{ep.name}</h4>
                                            <span>{ep.runtime}m</span>
                                        </div>
                                        <p>{truncate(ep.overview, 150)}</p>
                                    </div>
                                    <div className="episode_playIcon">
                                        <IoPlaySharp size={30} color="white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Premium Cast & Crew Section */}
                {cast.length > 0 && (
                    <div className="titleDetails_castSection">
                        <h3>Cast</h3>
                        <div className="titleDetails_castList">
                            {cast.map(actor => (
                                <div key={actor.id} className="cast_card">
                                    {actor.profile_path ? (
                                        <img src={`${base_url}${actor.profile_path}`} alt={actor.name} className="cast_img" />
                                    ) : (
                                        <div className="cast_placeholder">{actor.name.charAt(0)}</div>
                                    )}
                                    <p className="cast_name">{actor.name}</p>
                                    <p className="cast_character">{actor.character}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="titleDetails_recommendations">
                    <Row title="More Like This" fetchUrl={`/${type}/${id}/similar?api_key=${import.meta.env.VITE_TMDB_API_KEY}`} />
                </div>
            </div>
        </div>
    );
}

export default TitleDetails;
