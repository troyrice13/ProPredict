const axios = require('axios');  // Import axios
const Player = require('../classes/Player');
const Season = require('../classes/Season')
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.SPORTRADAR_API_KEY;

// Retry function to handle rate limits or temporary failures
async function fetchDataWithRetry(url, retries = 5, backoff = 3000) {
    try {
        return await axios.get(url);
    } catch (error) {
        if (error.response && error.response.status === 429 && retries > 0) {
            console.log(`Rate limit exceeded. Retrying in ${backoff / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, backoff));  // Wait for the backoff time before retrying
            return fetchDataWithRetry(url, retries - 1, backoff * 2);  // Exponentially increase backoff time
        } else {
            throw error;  // If no retries left or a different error, throw it
        }
    }
}

// Fetch and store stats for all players, but don't fetch player list again
async function fetchAndStorePlayers(playersCollection, seasonsCollection) {
    try {
        const players = await playersCollection.find({}).toArray();

        for (const playerData of players) {
            const player = new Player(playerData);
            await player.save(playersCollection);

            // Fetch current season stats
            const response = await fetchDataWithRetry(`https://api.sportradar.com/mlb/trial/v7/en/players/${player.id}/profile.json?api_key=${apiKey}`);
            const currentSeason = response.data.seasons.find(season => season.year === new Date().getFullYear() && season.type === 'REG');

            if (currentSeason) {
                const season = new Season({
                    playerId: player.id,
                    year: currentSeason.year,
                    type: currentSeason.type,
                    stats: currentSeason.totals,
                    lastUpdated: new Date()
                });
                await season.save(seasonsCollection);
            }
        }

        console.log('All player data and current season stats updated in MongoDB.');
    } catch (err) {
        console.error("Error fetching and storing player data", err);
    }
}

module.exports = fetchAndStorePlayers;
