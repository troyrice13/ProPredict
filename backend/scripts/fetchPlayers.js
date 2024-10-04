const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path')

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.SPORTSRADAR_API_KEY;

async function fetchAndStorePlayers(playersCollection) {
    try {
        const response = await axios.get(`https://api.sportradar.us/mlb/trial/v7/en/league/depth_charts.json?api_key=${apiKey}`);
        const teams = response.data.teams;

        for (const team of teams) {
            for (const position of team.positions) {
                for (const player of position.players) {
                    const playerData = {
                        _id: player.id,
                        full_name: player.full_name,
                    };

                    await playersCollection.updateOne(
                        { _id : player.id },
                        { $set: playerData },
                        { upsert: true }
                    );
                }
            }
        }

        console.log('All player names and IDs stored in MongoDB.')
    } catch (err) {
        console.error("Error fetching and storing player data", err)
    }
}

module.exports = fetchAndStorePlayers;