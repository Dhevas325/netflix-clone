import React, { useEffect } from 'react';
import HomeScreen from './HomeScreen';
import LoginScreen from './LoginScreen';
import ProfileScreen from './ProfileScreen';
import Player from './Player';
import SearchScreen from './SearchScreen';
import TitleDetails from './TitleDetails';
import MyListScreen from './MyListScreen';
import Intro from './Intro';
import { auth, db } from './firebase';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProfileSelectScreen from './ProfileSelectScreen';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout, selectUser, selectActiveProfile } from './features/userSlice';
import { setList } from './features/listSlice';
import { doc, onSnapshot } from "firebase/firestore";

import WatchParty from './WatchParty';

function App() {
  const user = useSelector(selectUser);
  const activeProfile = useSelector(selectActiveProfile);
  const dispatch = useDispatch();
  const [showIntro, setShowIntro] = React.useState(true);

  useEffect(() => {
    let unsubscribeList;

    const unsubscribeAuth = auth.onAuthStateChanged(userAuth => {
      console.log("Auth State Changed:", userAuth?.email);
      if (userAuth) {
        dispatch(login({
          uid: userAuth.uid,
          email: userAuth.email,
        }));

        unsubscribeList = onSnapshot(doc(db, "customers", userAuth.uid, "myList", "list"), (doc) => {
          if (doc.exists()) {
            dispatch(setList(doc.data().items || []));
          } else {
            dispatch(setList([]));
          }
        }, (error) => {
            console.error("Firestore error:", error);
        });

      } else {
        dispatch(logout());
        dispatch(setList([]));
        if (unsubscribeList) unsubscribeList();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeList) unsubscribeList();
    };
  }, [dispatch]);

  console.log("App Render - User:", !!user, "Profile:", !!activeProfile);

  return (
    <div className="app">
      {showIntro && <Intro onFinish={() => setShowIntro(false)} />}
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
        ) : !activeProfile ? (
          <ProfileSelectScreen />
        ) : (
          <Routes>
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/" element={<HomeScreen />} />
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/title/:type/:id" element={<TitleDetails />} />
            <Route path="/mylist" element={<MyListScreen />} />
            <Route path="/play/:type/:id" element={<Player />} />
            <Route path="/play/:type/:id/:season/:episode" element={<Player />} />
            <Route path="/watch-party/:type/:id" element={<WatchParty />} />
          </Routes>
        )}
      </Router>
    </div>
  );
}

export default App;
