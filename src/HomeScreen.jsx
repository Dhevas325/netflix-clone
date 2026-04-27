import React from 'react';
import Nav from './Nav';
import Banner from './Banner';
import Row from './Row';
import requests from './requests';
import { useSelector } from 'react-redux';
import { selectList } from './features/listSlice';
import { selectHistory } from './features/historySlice';
import { selectActiveProfile } from './features/userSlice';

import Top10Row from './Top10Row';
import MoodRow from './MoodRow';
import Footer from './Footer';

function HomeScreen() {
    const myList = useSelector(selectList);
    const history = useSelector(selectHistory);
    const activeProfile = useSelector(selectActiveProfile);
    const isKids = activeProfile?.isKids;

    return (
        <div className="homeScreen">
            <Nav />
            <Banner />

            {/* 1. User Specific / Resume */}
            {history?.length > 0 && (
                <Row title="Continue Watching" items={history} isLargeRow />
            )}

            <MoodRow />

            {/* 2. Main Authentic Netflix Core */}
            <Row title="Only on Netflix" fetchUrl={requests.fetchNetflixOriginals(isKids)} isLargeRow />
            <Row title="Trending Now" fetchUrl={requests.fetchTrending(isKids)} />
            
            <Top10Row title="Top 10 Movies in India Today"  fetchUrl={requests.fetchTop10Movies(isKids)} />
            <Top10Row title="Top 10 TV Shows in India Today"  fetchUrl={requests.fetchTop10Series(isKids)} />

            <Row title="New Releases" fetchUrl={requests.fetchRecentlyAdded(isKids)} />
            <Row title="Recently Added TV Shows" fetchUrl={requests.fetchNewNetflixSeries(isKids)} />

            {/* 3. Personalization */}
            {myList?.length > 0 && (
                <Row title="My List" items={myList} />
            )}
            {history?.length > 0 && (
                <Row 
                    title={`Because you watched ${history[0].title}`} 
                    fetchUrl={`/${history[0].media_type}/${history[0].id}/similar?api_key=${import.meta.env.VITE_TMDB_API_KEY}&include_adult=false&without_genres=10749&certification_country=IN&certification.lte=UA${isKids ? '&certification.lte=U' : ''}`} 
                />
            )}

            {/* 4. Netflix India Categories */}
            <Row title="Tamil-Language Movies" fetchUrl={requests.fetchTamilMovies(isKids)} />
            <Row title="Hindi-Language Movies" fetchUrl={requests.fetchHindiMovies(isKids)} />
            <Row title="Action & Adventure" fetchUrl={requests.fetchActionMovies(isKids)} />
            
            <Row title="Telugu-Language Movies" fetchUrl={requests.fetchTeluguMovies(isKids)} />
            <Row title="Malayalam-Language Movies" fetchUrl={requests.fetchMalayalamMovies(isKids)} />
            
            <Row title="Comedies" fetchUrl={requests.fetchComedyMovies(isKids)} />
            <Row title="Horror Movies" fetchUrl={requests.fetchHorrorMovies(isKids)} />
            <Row title="Documentaries" fetchUrl={requests.fetchDocumentaries(isKids)} />

            {/* 5. Coming Soon Section */}
            <Row title="Coming Soon" fetchUrl={requests.fetchComingSoon(isKids)} isLargeRow />
            
            <Footer />
        </div>
    );
}

export default HomeScreen;
