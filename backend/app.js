const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');
const fetchAndStorePlayers = require('./scripts/fetchPlayers');
const playerRoutes = require('./routes/players');

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const uri = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

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
        app.locals.playersCollection = playersCollection;

        console.log("Connected to MongoDB!");

        // Start Express server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

// Use routes
app.use('/api', playerRoutes);

connectToMongoDB().then(() => {
    fetchAndStorePlayers(playersCollection); // Fetch and store players on server start
});
