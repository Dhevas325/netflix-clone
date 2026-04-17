import React, { useEffect, useState } from 'react';
import HomeScreen from './HomeScreen';
import LoginScreen from './LoginScreen';
import ProfileScreen from './ProfileScreen';
import Player from './Player';
import SearchScreen from './SearchScreen';
import TitleDetails from './TitleDetails';
import { auth } from './firebase';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(userAuth => {
      if (userAuth) {
        setUser({
          uid: userAuth.uid,
          email: userAuth.email,
        });
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div className="app">
      <Router>
        {!user ? (
          <>
            <button 
              onClick={() => setUser({ uid: 'guest', email: 'guest@netflix.com' })}
              style={{
                position: 'fixed',
                top: '20px',
                right: '150px',
                zIndex: 9999,
                padding: '10px 20px',
                backgroundColor: '#008000',
                color: 'white',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderRadius: '3px'
              }}
            >
              Guest Login (Bypass)
            </button>
            <LoginScreen />
          </>
        ) : (
          <Routes>
            <Route path="/profile" element={<ProfileScreen user={user} />} />
            <Route path="/" element={<HomeScreen />} />
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/title/:type/:id" element={<TitleDetails />} />
            <Route path="/play/:type/:id" element={<Player />} />
            <Route path="/play/:type/:id/:season/:episode" element={<Player />} />
          </Routes>
        )}
      </Router>
    </div>
  );
}

export default App;
