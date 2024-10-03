const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');
const axios = require('axios');
const path = require('path');

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const uri = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;
const apiKey = process.env.SPORTRADAR_API_KEY;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let database;
let playersCollection;

// Connect to MongoDB once and reuse the client
async function connectToMongoDB() {
    try {
        await client.connect();
        database = client.db('Cluster-1');
        playersCollection = database.collection('players');
        console.log("Connected to MongoDB!");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

// Fetch and store players in MongoDB
async function fetchAndStorePlayers() {
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
                        { _id: player.id },
                        { $set: playerData },
                        { upsert: true }
                    );
                }
            }
        }

        console.log('All player names and IDs stored in MongoDB.');
    } catch (error) {
        console.error('Error fetching or storing player data', error);
    }
}

// Route to get all players
app.get('/api/players', async (req, res) => {
    try {
        const players = await playersCollection.find({}).toArray();
        res.json(players);
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ message: 'Error fetching players', error: error.message });
    }
});

app.get('/api/player/:id', async (req, res) => {
    const playerId = req.params.id;
    try {
        const response = await axios.get(`https://api.sportradar.com/mlb/trial/v7/en/players/${playerId}/profile.json?api_key=${apiKey}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching player stats:', error);
        res.status(500).json({ message: 'Error fetching player stats', error: error.message });
    }
});

connectToMongoDB().then(fetchAndStorePlayers);