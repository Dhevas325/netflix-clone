import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBP99z1njzTXV_BYe9JmjmS6ITwVvFMQ8U",
  authDomain: "netflix-clone-db-ab636.firebaseapp.com",
  projectId: "netflix-clone-db-ab636",
  storageBucket: "netflix-clone-db-ab636.firebasestorage.app",
  messagingSenderId: "845897264661",
  appId: "1:845897264661:web:26c2c5e7048967bf75281c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Use initializeFirestore with long polling to prevent "unavailable" errors
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
});

export { auth, db };

