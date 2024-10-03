const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb')


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

        app.get('/api/test-db', async (req, res) => {
            try {
                const database = client.db('Cluster-1');  // Specify your database name here
                const collection = database.collection('players');  // We will create this collection dynamically
        
                // Insert a test document
                const testDocument = { name: 'Test Player', team: 'Test Team' };
                const result = await collection.insertOne(testDocument);
        
                res.json({ message: 'Connected to MongoDB and inserted a test document!', data: result });
            } catch (error) {
                res.status(500).json({ error: 'Error connecting to MongoDB', details: error });
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
