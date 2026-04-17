import React from 'react';
import Nav from './Nav';
import Banner from './Banner';
import Row from './Row';
import requests from './requests';
import { useSelector } from 'react-redux';
import { selectList } from './features/listSlice';
import { useNavigate } from 'react-router-dom';

function HomeScreen() {
    const myList = useSelector(selectList);
    const navigate = useNavigate();

    const base_url = "https://image.tmdb.org/t/p/original/";

    return (
        <div className="homeScreen">
            <Nav />
            <Banner />
            {myList.length > 0 && (
                <div className="row">
                    <h2>My List</h2>
                    <div className="row_posters">
                        {myList.map((movie) => (
                            <img
                                key={movie.id}
                                onClick={() => navigate(`/title/${movie.media_type}/${movie.id}`)}
                                className="row_poster row_posterLarge"
                                src={`${base_url}${movie.poster_path}`}
                                alt={movie.title}
                            />
                        ))}
                    </div>
                </div>
            )}
            <Row title="Recently Added on Netflix" fetchUrl={requests.fetchRecentlyAdded} isLargeRow />
            <Row
                title="NETFLIX ORIGINALS"
                fetchUrl={requests.fetchNetflixOriginals}
            />
            <Row title="Trending Now" fetchUrl={requests.fetchTrending} />
            <Row title="Top Rated" fetchUrl={requests.fetchTopRated} />
            <Row title="Tamil Movies" fetchUrl={requests.fetchTamilMovies} />
            <Row title="Hindi Movies" fetchUrl={requests.fetchHindiMovies} />
            <Row title="Action Movies" fetchUrl={requests.fetchActionMovies} />
            <Row title="Comedy Movies" fetchUrl={requests.fetchComedyMovies} />
            <Row title="Horror Movies" fetchUrl={requests.fetchHorrorMovies} />
            <Row title="Romance Movies" fetchUrl={requests.fetchRomanceMovies} />
            <Row title="Documentaries" fetchUrl={requests.fetchDocumentaries} />
        </div>
    );
}

export default HomeScreen;
