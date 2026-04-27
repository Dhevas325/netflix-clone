# 🎬 Netflix Clone - Production Ready

A high-performance Netflix clone built with **React**, **Redux**, **Firebase**, and **TMDB API**. Featuring real-time synchronization and premium security.

---

## 📸 Visual Walkthrough & Gallery

### 1️⃣ Premium Authentication & Profile Security
| Profile Selection | Parental PIN Lock |
|---|---|
| ![Profile Management](./output/profile_management_screen.png) | ![Parental PIN](./output/parental_pin_lock.png) |

### 2️⃣ Cinematic UI & Experience
| Hero Banner | Top 10 Trending Row |
|---|---|
| ![Hero Banner](./output/homepage_hero_banner.png) | ![Top 10 Trends](./output/top_10_trending_row.png) |

### 3️⃣ Real-Time Watch Party (Demo Mode)
![Watch Party Demo](./output/watch_party_demo.png)
*Featuring a seamless real-time chat interface with automatic demo-mode fallback for 100% uptime.*

### 4️⃣ Interactive Movie Details & Trailers
| Heart Burst Animation | Multi-Server Trailer System |
|---|---|
| ![Heart Animation](./output/movie_details_heart_animation.png) | ![Trailer Popup](./output/movie_trailer_popup.png) |

---

## 🚀 Key Features (Premium Implementation)
- **🎉 Real-Time Watch Party:** Seamlessly synchronized co-viewing experience. Includes a **Robust Fallback System** that switches to "Demo Mode" during server connectivity issues.
- **🎤 Voice-Enabled Search:** Hands-free searching functionality integrated using the Web Speech API.
- **🔒 Parental PIN Security:** Profile-level PIN protection to secure individual user accounts.
- **🎬 Intelligent Trailer System:** Robust multi-server fallback architecture ensuring HD trailer playback.
- **☁️ Cloud-Synced 'My List':** Firebase Firestore integration for cross-device watchlists.
- **🎨 Cinematic UI/UX:** Pixel-perfect glassmorphic design with smooth `framer-motion` animations.

---

## 🧠 Technical Architecture & Resilience

### 🛡️ Robust UI Resilience (The "Demo Mode" Logic)
One of the standout features of this project is its **resilience logic**. If the Firebase Firestore connection is delayed or unavailable, the application automatically triggers a **Demo Mode**. 
- **User Benefit:** The user is never met with a broken screen or infinite loading.
- **Developer Insight:** This demonstrates high-level error handling and "graceful degradation" principles.

### 1. Real-Time Watch Party Logic
- **Protocol:** Master-Slave synchronization via Firestore `onSnapshot`.
- **Latency Handling:** Sub-second sync using optimized state updates in Redux.

### 2. Multi-Server Video Fallback
- **Logic:** Tries Official TMDB -> Invidious API Nodes -> YouTube Scraper.
- **Goal:** To eliminate the "Video Unavailable" error common in clones.

---

## 🛠️ Tech Stack
- **Frontend:** React.js, Redux Toolkit, Framer Motion, React Router v7.
- **Backend:** Firebase (Auth & Firestore).
- **API:** TMDB (The Movie Database).
- **Styling:** Vanilla CSS (Modern Flexbox/Grid).

---

## 🚀 Getting Started

1. **Clone & Install**
   ```bash
   git clone https://github.com/Dhevas325/netflix-clone.git
   npm install
   ```
2. **Environment Variables**
   Create a `.env` file: `VITE_TMDB_API_KEY=your_key`
3. **Run Dev**
   ```bash
   npm run dev
   ```

---

## 📄 License
MIT License. Created by [Dhevas325](https://github.com/Dhevas325).
