const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');
const axios = require('axios');


dotenv.config();

const app = express();
const uri = process.env.MONGODB_URI
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

async function run() {
    try {
        await client.connect();

        await client.db("admin").command({ ping: 1 });
        console.log("Connected to MongoDB!");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })

        app.get('/api/player/:id', async (req, res) => {
            const apiKey = process.env.SPORTRADAR_API_KEY;
            const playerId = req.params.id
        
            try {
                const response = await axios.get(`https://api.sportradar.com/mlb/trial/v7/en/players/${playerId}/profile.json?api_key=${apiKey}`);
                res.json(response.data);
            } catch (error) {
                res.status(500).json({ message: 'Error fetching player data', error: error.message });
            }
        });
        
    } catch (err) {
        console.error("MongoBD connection error: ", err);
        process.exit(1)
    }
}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Server is running and connected to MongoDB')
})
