const express = require('express');
const router = express.Router();
const Player = require('../classes/Player');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.SPORTRADAR_API_KEY;

// Route to get all players (from MongoDB)
router.get('/players', async (req, res) => {
    const playersCollection = req.app.locals.playersCollection;
    try {
        const players = await playersCollection.find({}).toArray();  // Fetch player list from MongoDB
        res.json(players);  // No need to fetch from API unless updating stats
    } catch (error) {
        console.error('Error fetching players', error);
        res.status(500).json({ message: 'Error fetching players', error: error.message });
    }
});

// Route to get a specific player by ID and predict next game stats
router.get('/player/:id', async (req, res) => {
    const playerId = req.params.id;
    const playersCollection = req.app.locals.playersCollection;

    try {
        const playerData = await playersCollection.findOne({ _id: playerId });  // Fetch from MongoDB

        if (playerData) {
            const player = new Player(playerData);

            // Check if the player stats are older than 24 hours
            const oneDay = 24 * 60 * 60 * 1000;
            const lastUpdated = new Date(playerData.lastUpdated);
            if (Date.now() - lastUpdated > oneDay) {
                await player.fetchStats(apiKey, playersCollection);  // Fetch live stats if outdated
            }

            const projection = player.predictNextGame();  // Predict future performance
            res.json({ stats: player.stats, projection });
        } else {
            res.status(404).json({ message: 'Player not found' });
        }
    } catch (error) {
        console.error('Error fetching player stats:', error);
        res.status(500).json({ message: 'Error fetching player stats', error: error.message });
    }
});

module.exports = router;
