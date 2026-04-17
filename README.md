#  Netflix Clone - Production Ready

A high-performance Netflix clone built with the **MERN stack**, **Firebase Authentication**, **Cloud Firestore**, and **TMDB API**.

## Visual Walkthrough

### 1. Secure Landing & Login
![Login](./screenshots/Login.jpeg)

### 2. Who's Watching? (Profile Selection)
![Profiles](./screenshots/manage%20profile.jpeg)

### 3. Premium Hero Banner
![Banner](./screenshots/home%20page1.jpeg)

### 4. Netflix Original Content
![Rows](./screenshots/home%20page%202.jpeg)

### 5. Regional Selections (Tamil & Hindi)
![Regional](./screenshots/home%20page3.jpeg)

### 6. Dynamic Title Details & Episodes
![Details](./screenshots/internal%20page.jpeg)

### 7. Ultra-Fast Global Streaming Player
![Player](./screenshots/video%20play.jpeg)

## Hollywood Features
- ** Secure Authentication**: Powered by Firebase Auth (Email/Password & Guest Bypass).
- ** Dynamic Search**: Real-time movie and TV show search using TMDB API.
- ** Advanced Player**: Multiple server options (Server 1, 2, 3) for smooth streaming.
- ** My List (Watchlist)**: Add your favorite titles to your personal list (Synced with Redux & Firestore).
- ** Premium UI**: Smooth transitions, glassmorphism, and Netflix-accurate design.
- ** Dynamic Banner**: Automatically fetches trending Netflix Originals for the hero section.

## Tech Stack
- **Frontend**: React.js, Redux Toolkit (State Management), React Router v7.
- **Backend**: Firebase (Authentication & Firestore).
- **API**: TMDB (The Movie Database).
- **Styling**: Vanilla CSS with modern flexbox/grid.

## Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/Dhevas325/netflix-clone.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root and add:
   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key
   ```

4. **Run the App**
   ```bash
   npm run dev
   ```

## Security Notice
If you accidentally pushed your `.env` file to GitHub, please follow these steps to remove it from history:
1. Add `.env` to your `.gitignore`.
2. Run `git rm --cached .env`.
3. Commit and push: `git commit -m "Remove sensitive .env file" && git push`.
4. **IMPORTANT**: Reset your TMDB API key in the TMDB dashboard.

## License
MIT License. Created by [Dhevas325](https://github.com/Dhevas325).
