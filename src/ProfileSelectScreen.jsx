import React from 'react';
import { useDispatch } from 'react-redux';
import { setProfile } from './features/userSlice';
import './ProfileSelectScreen.css';

const profiles = [
    { name: 'Dhevas', avatar: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png' },
    { name: 'Kids', avatar: 'https://i.pinimg.com/originals/fb/8e/8a/fb8e8a96fca2f049334f312086a6e2f6.png' },
    { name: 'Guest', avatar: 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/84c20033850498.56ba69ac290ea.png' },
];

function ProfileSelectScreen() {
    const dispatch = useDispatch();

    return (
        <div className="profileSelect">
            <div className="profileSelect_logo">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" />
            </div>
            
            <div className="profileSelect_body">
                <h1>Who's watching?</h1>
                <div className="profileSelect_list">
                    {profiles.map((profile) => (
                        <div 
                            key={profile.name} 
                            className="profileSelect_profile"
                            onClick={() => dispatch(setProfile(profile))}
                        >
                            <div className="avatar_wrapper">
                                <img src={profile.avatar} alt={profile.name} />
                                <div className="avatar_overlay"></div>
                            </div>
                            <span>{profile.name}</span>
                        </div>
                    ))}
                </div>
                <button className="profileSelect_manage">MANAGE PROFILES</button>
            </div>
        </div>
    );
}

export default ProfileSelectScreen;
