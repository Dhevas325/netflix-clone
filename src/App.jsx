import React, { useEffect } from 'react';
import HomeScreen from './HomeScreen';
import LoginScreen from './LoginScreen';
import ProfileScreen from './ProfileScreen';
import Player from './Player';
import SearchScreen from './SearchScreen';
import TitleDetails from './TitleDetails';
import { auth } from './firebase';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { login, logout, selectUser } from './features/userSlice';

function App() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(userAuth => {
      if (userAuth) {
        dispatch(login({
          uid: userAuth.uid,
          email: userAuth.email,
        }));
      } else {
        dispatch(logout());
      }
    });

    return unsubscribe;
  }, [dispatch]);

  return (
    <div className="app">
      <Router>
        {!user ? (
          <>
            <button 
              onClick={() => dispatch(login({ uid: 'guest', email: 'guest@netflix.com' }))}
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
            <Route path="/profile" element={<ProfileScreen />} />
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
