import React from 'react';
import './ProfileScreen.css';
import Nav from './Nav';
import { auth } from './firebase';

function ProfileScreen({ user }) {
    return (
        <div className="profileScreen">
            <Nav />
            <div className="profileScreen_body">
                <h1>Edit Profile</h1>
                <div className="profileScreen_info">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
                        alt="Netflix Avatar"
                    />
                    <div className="profileScreen_details">
                        <h2>{user?.email || "Guest"}</h2>
                        <div className="profileScreen_plans">
                            <h3>Plans (Current Plan: Premium)</h3>
                            
                            <div className="profileScreen_plan">
                                <div className="plan_info">
                                    <h5>Netflix Standard</h5>
                                    <h6>1080p</h6>
                                </div>
                                <button className="plan_button">Subscribe</button>
                            </div>
                            
                            <div className="profileScreen_plan">
                                <div className="plan_info">
                                    <h5>Netflix Basic</h5>
                                    <h6>720p</h6>
                                </div>
                                <button className="plan_button">Subscribe</button>
                            </div>

                            <div className="profileScreen_plan plan_current">
                                <div className="plan_info">
                                    <h5>Netflix Premium</h5>
                                    <h6>4K + HDR</h6>
                                </div>
                                <button className="plan_button plan_active">Current Package</button>
                            </div>

                            <button
                                onClick={() => auth.signOut()}
                                className="profileScreen_signOut"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileScreen;
