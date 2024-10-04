const express = require('express');
const axios = require('axios');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.SPORTSRADAR_API_KEY;


router.get('/players', async (req, res) => {
    const playersCollection = req.app.locals.playersCollection;
    try {
        const players = await playersCollection.find({}).toArray();
        res.json(players)
    } catch (error) {
        console.error('Error fetching players', error);
        res.status(500).json({ message: 'Error fetching players', error: error.message });
    }
});

router.get('/player/:id', async (req, res) => {
    const playerId = req.params.id;
    try {
        const response = await axios.get(`https://api.sportradar.com/mlb/trial/v7/en/players/${playerId}/profile.json?api_key=${apiKey}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching player stats: ', error);
        res.status(500).json({ message: 'Error fetching player stats', error: error.message })
    }
});

module.exports = router;
