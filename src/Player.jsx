import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import axios from './axios';

const providers = [
    { name: "Server 1", getUrl: (type, vid) => type === 'tv' ? `https://vidsrc.xyz/embed/tv/${vid}` : `https://vidsrc.xyz/embed/movie/${vid}` },
    { name: "Server 2", getUrl: (type, vid) => type === 'tv' ? `https://vidlink.pro/tv/${vid}` : `https://vidlink.pro/movie/${vid}` },
    { name: "Server 3", getUrl: (type, vid) => type === 'tv' ? `https://vidsrc.me/embed/tv/${vid}` : `https://vidsrc.me/embed/movie/${vid}` },
    { name: "Server 4", getUrl: (type, vid) => type === 'tv' ? `https://vidsrc.cc/v2/embed/tv/${vid}` : `https://vidsrc.cc/v2/embed/movie/${vid}` },
];

function Player() {
    const navigate = useNavigate();
    const { type, id, season, episode } = useParams();
    const [imdbId, setImdbId] = useState(null);
    const [selectedProvider, setSelectedProvider] = useState(0);

    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

    useEffect(() => {
        async function fetchIMDB() {
            if (!API_KEY) return;
            try {
                const res = await axios.get(`${type}/${id}/external_ids?api_key=${API_KEY}`);
                setImdbId(res.data.imdb_id || null);
            } catch (e) { console.error("ID fetch failed"); }
        }
        fetchIMDB();
    }, [type, id, API_KEY]);

    const videoId = id || imdbId;
    let finalId = videoId;
    if (type === 'tv') {
        finalId = `${videoId}/${season || 1}/${episode || 1}`;
    }

    const srcUrl = providers[selectedProvider].getUrl(type, finalId);

    return (
        <div className="player">
            <div className="player_back" onClick={() => navigate(-1)}>
                <IoArrowBack size={40} color="white" />
            </div>

            <div className="player_controls">
                {providers.map((p, i) => (
                    <button 
                        key={i} 
                        className={`p_btn ${selectedProvider === i && 'active'}`}
                        onClick={() => setSelectedProvider(i)}
                    >
                        {p.name}
                    </button>
                ))}
            </div>
            
            <iframe
                src={srcUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                title="Movie Player"
            ></iframe>
        </div>
    );
}

export default Player;
