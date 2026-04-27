import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { IoArrowBack, IoPlaySkipForward, IoEllipsisVertical, IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import axios from './axios';
import { useDispatch } from 'react-redux';
import { addToHistory } from './features/historySlice';

const providers = [
    { name: "Server 1", getUrl: (type, vid) => type === 'tv' ? `https://vidsrc.xyz/embed/tv/${vid}` : `https://vidsrc.xyz/embed/movie/${vid}` },
    { name: "Server 2", getUrl: (type, vid) => type === 'tv' ? `https://vidlink.pro/tv/${vid}` : `https://vidlink.pro/movie/${vid}` },
    { name: "Server 3", getUrl: (type, vid) => type === 'tv' ? `https://vidsrc.me/embed/tv/${vid}` : `https://vidsrc.me/embed/movie/${vid}` },
    { name: "Server 4", getUrl: (type, vid) => type === 'tv' ? `https://vidsrc.cc/v2/embed/tv/${vid}` : `https://vidsrc.cc/v2/embed/movie/${vid}` },
];

function Player({ isWatchParty = false }) {
    const navigate = useNavigate();
    const { type, id, season, episode } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialServer = parseInt(queryParams.get('server') || 0);

    const [imdbId, setImdbId] = useState(null);
    const [selectedProvider, setSelectedProvider] = useState(initialServer);
    const [totalEpisodes, setTotalEpisodes] = useState(null);
    const [totalSeasons, setTotalSeasons] = useState(null);
    const [showNextOverlay, setShowNextOverlay] = useState(false);
    const [showServerMenu, setShowServerMenu] = useState(false);
    const [showSubtitlesMenu, setShowSubtitlesMenu] = useState(false);
    const [selectedSub, setSelectedSub] = useState('Off');
    const [selectedAudio, setSelectedAudio] = useState('English [Original]');

    const currentEpisode = parseInt(episode || 1);
    const currentSeason = parseInt(season || 1);

    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    const dispatch = useDispatch();

    useEffect(() => {
        setShowNextOverlay(false);

        async function fetchIMDB() {
            if (!API_KEY) return;
            try {
                const res = await axios.get(`${type}/${id}/external_ids?api_key=${API_KEY}`);
                setImdbId(res.data.imdb_id || null);
            } catch (e) { console.error("ID fetch failed"); }
        }
        fetchIMDB();

        async function fetchDetails() {
            try {
                const res = await axios.get(`${type}/${id}?api_key=${API_KEY}`);
                dispatch(addToHistory({
                    movie: {
                        id: res.data.id,
                        title: res.data.title || res.data.name,
                        poster_path: res.data.poster_path,
                        backdrop_path: res.data.backdrop_path,
                        media_type: type,
                        season: currentSeason,
                        episode: currentEpisode
                    },
                    server: selectedProvider
                }));
                if (type === 'tv') {
                    setTotalSeasons(res.data.number_of_seasons);
                    // Fetch episode count for current season
                    const seasonRes = await axios.get(`/tv/${id}/season/${currentSeason}?api_key=${API_KEY}`);
                    setTotalEpisodes(seasonRes.data.episodes?.length || null);
                }
            } catch (e) { console.error("Details fetch failed"); }
        }
        fetchDetails();
    }, [type, id, season, episode, API_KEY, dispatch, currentSeason, selectedProvider]);

    // Show "Next Episode" overlay after 30 min for TV
    useEffect(() => {
        if (type !== 'tv') return;
        const timer = setTimeout(() => setShowNextOverlay(true), 30 * 60 * 1000); // 30 min
        return () => clearTimeout(timer);
    }, [type, season, episode]);

    const goNextEpisode = () => {
        if (totalEpisodes && currentEpisode < totalEpisodes) {
            navigate(`/play/tv/${id}/${currentSeason}/${currentEpisode + 1}`);
        } else if (totalSeasons && currentSeason < totalSeasons) {
            navigate(`/play/tv/${id}/${currentSeason + 1}/1`);
        }
    };

    const hasNextEpisode = type === 'tv' && (
        (totalEpisodes && currentEpisode < totalEpisodes) ||
        (totalSeasons && currentSeason < totalSeasons)
    );

    const videoId = id || imdbId;
    let finalId = videoId;
    if (type === 'tv') {
        finalId = `${videoId}/${currentSeason}/${currentEpisode}`;
    }

    const srcUrl = providers[selectedProvider].getUrl(type, finalId);

    return (
        <div className="player">
            <div className="player_back" onClick={() => navigate(-1)}>
                <IoArrowBack size={40} color="white" />
            </div>

            {/* Player Controls (Top Right) */}
            <div className="player_controls">
                {/* Server Menu */}
                <div style={{ position: 'relative' }}>
                    <button 
                        className="server_menu_toggle" 
                        onClick={() => setShowServerMenu(!showServerMenu)}
                        title="Change Server"
                    >
                        <IoEllipsisVertical size={30} color="white" />
                    </button>
                    
                    {showServerMenu && (
                        <div className="server_dropdown">
                            <div className="server_dropdown_header">Select Server</div>
                            {providers.map((p, i) => (
                                <button
                                    key={i}
                                    className={`server_dropdown_item ${selectedProvider === i ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedProvider(i);
                                        setShowServerMenu(false);
                                    }}
                                >
                                    {p.name}
                                    {selectedProvider === i && <span className="active_dot">•</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Next Episode Button (always visible for TV) */}
            {hasNextEpisode && (
                <button className="player_nextEp" onClick={goNextEpisode}>
                    <IoPlaySkipForward size={18} />
                    Next Episode
                </button>
            )}

            {/* Episode Info for TV */}
            {type === 'tv' && (
                <div className="player_episodeInfo">
                    S{currentSeason} E{currentEpisode}
                </div>
            )}

            <iframe
                src={srcUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                title="Movie Player"
            ></iframe>

            {/* Premium Netflix Skip Intro Button (Appears for first 90s) */}
            {type === 'tv' && (
                <button className="player_skipIntro" onClick={() => {/* Skip logic if possible */}}>
                    Skip Intro
                </button>
            )}

            {/* Next Episode Countdown Overlay (Appears near end) */}
            {showNextOverlay && hasNextEpisode && (
                <div className="player_nextOverlay">
                    <div className="next_content">
                        <p>Next Episode starting in 5s...</p>
                        <button onClick={goNextEpisode}>Play Now</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Player;
