const axios = require('axios');  // Import axios
const Player = require('../classes/Player');
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
async function fetchAndStorePlayers(playersCollection) {
    try {
        const players = await playersCollection.find({}).toArray();  // Fetch players from MongoDB

        for (const playerData of players) {
            const player = new Player(playerData);

            // Check if player data needs updating (based on TTL or other conditions)
            const existingPlayer = await playersCollection.findOne({ _id: player.id });
            const oneDay = 24 * 60 * 60 * 1000;  // Update if more than 24 hours have passed

            if (existingPlayer && (Date.now() - new Date(existingPlayer.lastUpdated)) < oneDay) {
                console.log(`Player ${player.full_name} stats are up-to-date.`);
                continue;
            }

            await player.fetchStats(apiKey, playersCollection);  // Fetch live stats for the player and update MongoDB
        }

        console.log('All player stats updated in MongoDB.');
    } catch (err) {
        console.error("Error fetching and storing player data", err);
    }
}

module.exports = fetchAndStorePlayers;
