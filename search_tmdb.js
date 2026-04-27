import https from 'https';
import fs from 'fs';

const API_KEY = "679c65ee1a364bb21a71bb952ba5c2a1"; // We need the user's actual API key. Let's read it from .env
const envFile = fs.readFileSync('.env', 'utf-8');
const match = envFile.match(/VITE_TMDB_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : '';

const queries = ['With Love', 'Made in Korea', 'Youth', 'Dragon', 'Dude'];

async function search() {
    for (const query of queries) {
        const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=1`;
        
        await new Promise((resolve) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const json = JSON.parse(data);
                    console.log(`\nResults for: ${query}`);
                    if(json.results) {
                        json.results.slice(0, 3).forEach(r => {
                            console.log(`- [${r.media_type}] ID: ${r.id} | Title: ${r.title || r.name} | Date: ${r.release_date || r.first_air_date}`);
                        });
                    }
                    resolve();
                });
            });
        });
    }
}

search();
