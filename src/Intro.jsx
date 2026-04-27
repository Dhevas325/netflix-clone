import React, { useEffect, useState } from 'react';
import './Intro.css';

function Intro({ onFinish }) {
    const [animationFinished, setAnimationFinished] = useState(false);

    useEffect(() => {
        // Play the iconic Netflix sound if desired
        // const audio = new Audio('https://www.myinstants.com/media/sounds/netflix-intro-sound-effect.mp3');
        // audio.play().catch(e => console.log("Audio play blocked"));

        const timer = setTimeout(() => {
            setAnimationFinished(true);
            setTimeout(onFinish, 1000); // Give time for fade out
        }, 3500);

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div className={`intro_container ${animationFinished ? 'fade_out' : ''}`}>
            <svg viewBox="0 0 3500 1000">
                <path d="M512 0v1024h128v-1024h-128zM128 0v1024h128v-1024h-128zM256 0l256 1024h128l-256-1024h-128z" fill="#e50914" />
            </svg>
        </div>
    );
}

export default Intro;
