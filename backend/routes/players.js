const express = require('express');
const router = express.Router();

// Route to get all players (just id and full_name)
router.get('/players', async (req, res) => {
    const playersCollection = req.app.locals.playersCollection;
    try {
        const players = await playersCollection.find({}, { projection: { _id: 1, full_name: 1 } }).toArray();
        res.json(players);
    } catch (error) {
        console.error('Error fetching players', error);
        res.status(500).json({ message: 'Error fetching players', error: error.message });
    }
});

// Route to get a specific player by ID with their stats
router.get('/player/:id', async (req, res) => {
    const playerId = req.params.id;
    const playersCollection = req.app.locals.playersCollection;
    const seasonsCollection = req.app.locals.seasonsCollection;

    try {
        const playerInfo = await playersCollection.findOne({ _id: playerId });
        if (!playerInfo) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const currentYear = new Date().getFullYear();
        const playerStats = await seasonsCollection.findOne({ 
            playerId: playerId,
            year: currentYear,
            type: "REG"
        });

        res.json({ playerInfo, playerStats });
    } catch (error) {
        console.error('Error fetching player data:', error);
        res.status(500).json({ message: 'Error fetching player data', error: error.message });
    }
});

module.exports = router;