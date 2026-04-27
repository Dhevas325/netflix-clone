import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setProfile } from './features/userSlice';
import './ProfileSelectScreen.css';
import { motion, AnimatePresence } from 'framer-motion';
import { IoLockClosed, IoCloseOutline } from 'react-icons/io5';

const profiles = [
    { name: 'Dheva', avatar: '/avatars/blue.svg', pin: '1234' },
    { name: 'DHEVASUND...', avatar: '/avatars/yellow.svg' },
    { name: 'Chitra', avatar: '/avatars/red.svg', pin: '0000' },
    { name: 'D', avatar: '/avatars/green.svg' },
    { name: 'Children', avatar: '/avatars/kids.svg', isKids: true },
];

function ProfileSelectScreen() {
    const dispatch = useDispatch();
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [showPinScreen, setShowPinScreen] = useState(false);
    const [pinProfile, setPinProfile] = useState(null);
    const [pin, setPin] = useState(['', '', '', '']);
    const [pinError, setPinError] = useState(false);
    const pinInputs = useRef([]);

    const handleSelect = (profile) => {
        if (profile.pin) {
            setPinProfile(profile);
            setShowPinScreen(true);
            setPin(['', '', '', '']);
            setPinError(false);
        } else {
            setSelectedProfile(profile.name);
            setTimeout(() => {
                dispatch(setProfile(profile));
            }, 700);
        }
    };

    const handlePinChange = (index, value) => {
        if (isNaN(value)) return;
        const newPin = [...pin];
        newPin[index] = value.substring(value.length - 1);
        setPin(newPin);
        setPinError(false);

        // Auto focus next
        if (value && index < 3) {
            pinInputs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            pinInputs.current[index - 1].focus();
        }
    };

    useEffect(() => {
        if (pin.every(digit => digit !== '')) {
            const enteredPin = pin.join('');
            if (enteredPin === pinProfile?.pin) {
                // Success!
                setShowPinScreen(false);
                setSelectedProfile(pinProfile.name);
                setTimeout(() => {
                    dispatch(setProfile(pinProfile));
                }, 700);
            } else {
                setPinError(true);
                setPin(['', '', '', '']);
                pinInputs.current[0].focus();
            }
        }
    }, [pin, pinProfile, dispatch]);

    return (
        <div className="profileSelect">
            <div className="profileSelect_logo">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" />
            </div>
            
            <div className="profileSelect_body">
                <h1>Who's watching?</h1>
                <div className="profileSelect_list">
                    {profiles.map((profile) => (
                        <motion.div 
                            key={profile.name} 
                            className="profileSelect_profile"
                            onClick={() => handleSelect(profile)}
                            animate={selectedProfile === profile.name ? { scale: 3, opacity: 0 } : {}}
                            transition={{ duration: 0.7, ease: "easeInOut" }}
                        >
                            <div className="avatar_wrapper">
                                <img src={profile.avatar} alt={profile.name} />
                                <div className="avatar_overlay"></div>
                                {profile.pin && <IoLockClosed className="profile_lock_icon" />}
                            </div>
                            <span>{profile.name}</span>
                        </motion.div>
                    ))}
                </div>
                <button className="profileSelect_manage">MANAGE PROFILES</button>
            </div>

            {/* PIN Overlay */}
            <AnimatePresence>
                {showPinScreen && (
                    <motion.div 
                        className="pinOverlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <button className="pin_close" onClick={() => setShowPinScreen(false)}>
                            <IoCloseOutline size={40} />
                        </button>

                        <div className="pin_container">
                            <span className="pin_sub">Profile Lock is on.</span>
                            <h2>Enter your PIN to access this profile.</h2>
                            
                            <div className="pin_profile_preview">
                                <img src={pinProfile?.avatar} alt="" />
                                <span>{pinProfile?.name}</span>
                            </div>

                            <div className={`pin_inputs ${pinError ? 'shake' : ''}`}>
                                {pin.map((digit, i) => (
                                    <input
                                        key={i}
                                        type="password"
                                        maxLength="1"
                                        value={digit}
                                        ref={el => pinInputs.current[i] = el}
                                        onChange={(e) => handlePinChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>
                            
                            {pinError && <p className="pin_error_msg">Whoops, wrong PIN. Please try again.</p>}
                            
                            <p className="pin_forgot">Forgot PIN?</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ProfileSelectScreen;

