import React from 'react';
import { useSelector } from 'react-redux';
import { selectList } from './features/listSlice';
import Nav from './Nav';
import { useNavigate } from 'react-router-dom';
import './MyListScreen.css';

function MyListScreen() {
    const myList = useSelector(selectList);
    const navigate = useNavigate();
    const base_url = "https://image.tmdb.org/t/p/original/";

    const handleClick = (movie) => {
        const type = movie.media_type || (movie.name ? 'tv' : 'movie');
        navigate(`/title/${type}/${movie.id}`);
    };

    return (
        <div className="myListScreen">
            <Nav />
            <div className="myList_content">
                <h1>My List</h1>
                {myList.length > 0 ? (
                    <div className="myList_grid">
                        {myList.map((movie) => (
                            <div key={movie.id} className="myList_item" onClick={() => handleClick(movie)}>
                                <img 
                                    src={`${base_url}${movie.poster_path || movie.backdrop_path}`} 
                                    alt={movie.title || movie.name} 
                                />
                                <div className="myList_item_info">
                                    <p>{movie.title || movie.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="myList_empty">
                        <p>You haven't added anything to your list yet.</p>
                        <button onClick={() => navigate('/')}>Browse Movies</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyListScreen;
