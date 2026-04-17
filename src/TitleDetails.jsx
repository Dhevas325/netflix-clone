import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from './axios';
import { fetchDetails, fetchSeason } from './requests';
import Nav from './Nav';
import './TitleDetails.css';
import { IoPlaySharp } from 'react-icons/io5';

function TitleDetails() {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState({});
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [episodes, setEpisodes] = useState([]);

    const base_url = "https://image.tmdb.org/t/p/original/";

    useEffect(() => {
        async function fetchMovieData() {
            const request = await axios.get(fetchDetails(type, id));
            setMovie(request.data);
            if (type === 'tv' && request.data.seasons) {
                // Filter out specials (season 0) if desired, but here we just keep them all
                const actualSeasons = request.data.seasons.filter(s => s.season_number > 0);
                setSeasons(actualSeasons);
                if (actualSeasons.length > 0) {
                    setSelectedSeason(actualSeasons[0].season_number);
                }
            }
        }
        fetchMovieData();
    }, [type, id]);

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

    const truncate = (string, n) => {
        return string?.length > n ? string.substr(0, n - 1) + '...' : string;
    };

    return (
        <div className="titleDetails">
            <Nav />
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
                    {type === 'movie' && (
                        <button className="titleDetails_playButton" onClick={handlePlayMovie}>
                            <IoPlaySharp size={24} /> <span>Play</span>
                        </button>
                    )}
                    <h2 className="titleDetails_description">
                        {truncate(movie?.overview, 300)}
                    </h2>
                </div>
                <div className="titleDetails_banner_fadeBottom"></div>
            </div>

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
            </div>
        </div>
    );
}

export default TitleDetails;
