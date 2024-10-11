const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');
const cron = require('node-cron');
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
let seasonsCollection;


async function connectToMongoDB() {
    try {
        await client.connect();
        database = client.db('Cluster-1');
        playersCollection = database.collection('players');
        app.locals.playersCollection = playersCollection;

        seasonsCollection = database.collection('seasons');
        app.locals.seasonsCollection = seasonsCollection;

        console.log("Connected to MongoDB!");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}


app.use('/api', playerRoutes);


cron.schedule('0 0 * * *', async () => { 
    console.log('Running daily player stats update...');
    const fetchAndStorePlayers = require('./scripts/fetchPlayers');
    await fetchAndStorePlayers(playersCollection, seasonsCollection);
});

connectToMongoDB(); 