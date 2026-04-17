import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectActiveProfile } from './features/userSlice';

function Nav() {
    const [show, handleShow] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const navigate = useNavigate();
    const activeProfile = useSelector(selectActiveProfile);

    const transitionNavBar = () => {
        if (window.scrollY > 100) {
            handleShow(true);
        } else {
            handleShow(false);
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", transitionNavBar);
        return () => window.removeEventListener("scroll", transitionNavBar);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/search?q=${searchInput}`);
        }
    };

    return (
        <div className={`nav ${show && "nav_black"}`}>
            <img
                onClick={() => navigate('/')}
                className="nav_logo"
                style={{ cursor: 'pointer' }}
                src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
                alt="Netflix Logo"
            />
            
            <form onSubmit={handleSearch} className="nav_search">
                <input 
                    type="text" 
                    placeholder="Search for movies or series..." 
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
            </form>

            <div className="nav_right">
                {activeProfile && <span className="nav_profileName">{activeProfile.name}</span>}
                <img
                    onClick={() => navigate('/profile')}
                    className="nav_avatar"
                    style={{ cursor: 'pointer' }}
                    src={activeProfile?.avatar || "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"}
                    alt="Netflix Avatar"
                />
            </div>
        </div>
    );
}

export default Nav;
