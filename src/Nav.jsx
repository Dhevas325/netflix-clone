import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMicOutline, IoMic, IoTimeOutline, IoCloseOutline, IoTrashOutline, IoCreateOutline, IoPersonOutline, IoHelpCircleOutline, IoSwapHorizontalOutline } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { auth } from './firebase';
import { addToHistory, removeFromHistory, clearHistory, selectHistory } from './features/historySlice';
import { logout, setProfile, selectActiveProfile } from './features/userSlice';
import './Nav.css';

function Nav() {
    const [show, handleShow] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [showLanguages, setShowLanguages] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const activeProfile = useSelector(selectActiveProfile);
    const history = useSelector(selectHistory);

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    
    // Mock profiles for the dropdown (in a real app, these would come from the database)
    const otherProfiles = [
        { name: 'Dhevasund...', avatar: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png' },
        { name: 'Chitra', avatar: 'https://occ-0-6247-2164.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABdpkabKqQAIn_98vO2sy9N-78HwB5Xlq3S8P9375Fm6N65a4O99rI495A2pQh72E6FpZ6G9Gv7m9v9v9v9v9v9v9v9v.png?r=54d' },
        { name: 'D', avatar: 'https://occ-0-6247-2164.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABdYjZ6G9Gv7m9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v.png?r=e6e' },
        { name: 'Children', avatar: 'https://occ-0-6247-2164.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABS9zZ6G9Gv7m9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v.png?r=88c', isKids: true }
    ].filter(p => p.name !== activeProfile?.name);

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

    // Real-time search as you type
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput.trim()) {
                navigate(`/search?q=${searchInput}`);
                dispatch(addToHistory(searchInput.trim()));
            }
        }, 800); // 800ms debounce
        return () => clearTimeout(timer);
    }, [searchInput, navigate, dispatch]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/search?q=${searchInput}`);
            dispatch(addToHistory(searchInput.trim()));
            setShowHistory(false);
        }
    };

    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support voice search. Please use Chrome.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.continuous = true; // Keep listening until final
        recognition.interimResults = true;

        try {
            recognition.start();
            setIsListening(true);
            setSearchInput(''); // Clear previous search
        } catch (e) {
            setIsListening(false);
        }

        recognition.onresult = (event) => {
            let fullTranscript = '';
            for (let i = 0; i < event.results.length; ++i) {
                fullTranscript += event.results[i][0].transcript;
            }

            // UPDATE LIVE!
            setSearchInput(fullTranscript);
            
            // Auto-navigate after a short silence or if it's confident
            const lastResult = event.results[event.results.length - 1];
            if (lastResult.isFinal) {
                setTimeout(() => {
                    setIsListening(false);
                    recognition.stop();
                    navigate(`/search?q=${fullTranscript}`);
                    dispatch(addToHistory(fullTranscript));
                }, 800);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
    };

    return (
        <div className={`nav ${show && "nav_black"}`}>
            {isListening && (
                <div className="nav_voiceOverlay">
                    <div className="voiceOverlay_content">
                        <div className="voice_pulse">
                             <IoMic size={60} color="#e50914" />
                        </div>
                        <p>{searchInput || "Listening..."}</p>
                        <span>Speak now to search</span>
                        <button className="voice_stop_btn" onClick={() => setIsListening(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            <img
                onClick={() => navigate('/')}
                className="nav_logo"
                style={{ cursor: 'pointer' }}
                src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
                alt="Netflix Logo"
            />

            <div className="nav_links">
                <span onClick={() => navigate('/')}>Home</span>
                <span onClick={() => navigate('/')}>TV Shows</span>
                <span onClick={() => navigate('/')}>Movies</span>
                <div className="nav_languages_wrap">
                    <span onClick={() => setShowLanguages(!showLanguages)}>Browse by Languages ▾</span>
                    {showLanguages && (
                        <div className="nav_languages_dropdown">
                            <p onClick={() => {setSearchInput('Tamil'); navigate('/search?q=Tamil'); setShowLanguages(false)}}>Tamil</p>
                            <p onClick={() => {setSearchInput('Hindi'); navigate('/search?q=Hindi'); setShowLanguages(false)}}>Hindi</p>
                            <p onClick={() => {setSearchInput('Telugu'); navigate('/search?q=Telugu'); setShowLanguages(false)}}>Telugu</p>
                            <p onClick={() => {setSearchInput('Malayalam'); navigate('/search?q=Malayalam'); setShowLanguages(false)}}>Malayalam</p>
                            <p onClick={() => {setSearchInput('Kannada'); navigate('/search?q=Kannada'); setShowLanguages(false)}}>Kannada</p>
                            <p onClick={() => {setSearchInput('English'); navigate('/search?q=English'); setShowLanguages(false)}}>English</p>
                        </div>
                    )}
                </div>
                <span onClick={() => navigate('/mylist')}>My List</span>
            </div>
            
            <div className="nav_search_container">
                <form onSubmit={handleSearch} className="nav_search">
                    <input 
                        type="text" 
                        placeholder="Search for movies..." 
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onFocus={() => setShowHistory(true)}
                        onBlur={() => setTimeout(() => setShowHistory(false), 200) /* delay to allow clicks */}
                    />
                    {searchInput && (
                        <span className="nav_clearSearch" onClick={() => setSearchInput('')}>✕</span>
                    )}
                    <button 
                        type="button" 
                        className={`nav_voiceBtn ${isListening && 'listening'}`}
                        onClick={handleVoiceSearch}
                    >
                        {isListening ? <IoMic size={20} color="#e50914" /> : <IoMicOutline size={20} color="white" />}
                    </button>
                </form>

                {showHistory && history.length > 0 && (
                    <div className="nav_history_dropdown">
                        <div className="history_header">
                            <span>Recent Searches</span>
                            <button className="clear_all_btn" onClick={() => dispatch(clearHistory())}>
                                <IoTrashOutline /> Clear All
                            </button>
                        </div>
                        {history.map((item, index) => (
                            <div key={index} className="history_item">
                                <div className="history_text" onClick={() => { setSearchInput(item); navigate(`/search?q=${item}`); setShowHistory(false); }}>
                                    <IoTimeOutline />
                                    <span>{item}</span>
                                </div>
                                <IoCloseOutline className="remove_item" onClick={() => dispatch(removeFromHistory(item))} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="nav_right" 
                onMouseEnter={() => setShowProfileMenu(true)}
                onMouseLeave={() => setShowProfileMenu(false)}
            >
                <div className="nav_profile_wrap">
                    <img
                        className="nav_avatar"
                        src={activeProfile?.avatar || "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"}
                        alt="Netflix Avatar"
                    />
                    <span className="nav_caret">▾</span>

                    {showProfileMenu && (
                        <div className="nav_profile_dropdown">
                            <div className="dropdown_arrow"></div>
                            
                            <div className="dropdown_profiles">
                                {otherProfiles.map((profile, index) => (
                                    <div key={index} className="dropdown_profile_item" onClick={() => { dispatch(setProfile(profile)); navigate('/'); }}>
                                        <img src={profile.avatar} alt={profile.name} />
                                        <span>{profile.name}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="dropdown_menu_items">
                                <div className="menu_item" onClick={() => navigate('/profile')}>
                                    <IoCreateOutline />
                                    <span>Manage Profiles</span>
                                </div>
                                <div className="menu_item">
                                    <IoSwapHorizontalOutline />
                                    <span>Transfer Profile</span>
                                </div>
                                <div className="menu_item">
                                    <IoPersonOutline />
                                    <span>Account</span>
                                </div>
                                <div className="menu_item">
                                    <IoHelpCircleOutline />
                                    <span>Help Centre</span>
                                </div>
                            </div>

                            <div className="dropdown_signout" onClick={() => { auth.signOut(); dispatch(logout()); navigate('/'); }}>
                                Sign out of Netflix
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Nav;
