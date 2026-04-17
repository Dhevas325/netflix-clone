import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Nav() {
    const [show, handleShow] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const navigate = useNavigate();

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

            <img
                onClick={() => navigate('/profile')}
                className="nav_avatar"
                style={{ cursor: 'pointer' }}
                src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
                alt="Netflix Avatar"
            />
        </div>
    );
}

export default Nav;
