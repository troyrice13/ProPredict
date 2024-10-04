const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;

async function renameCollections() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('Cluster-1');

        console.log('Renaming collections...');
        
        // Check if 'old_players' collection already exists
        const collections = await db.listCollections().toArray();
        const oldPlayersExists = collections.some(col => col.name === 'old_players');

        if (!oldPlayersExists) {
            // Rename 'players' to 'old_players' only if 'old_players' doesn't exist
            await db.collection('players').rename('old_players');
            console.log("Renamed 'players' to 'old_players'");
        } else {
            console.log("'old_players' collection already exists, skipping rename");
        }

        // Rename 'new_players' to 'players'
        await db.collection('new_players').rename('players');
        console.log("Renamed 'new_players' to 'players'");

        console.log('Collections renamed successfully');

    } catch (error) {
        console.error('Error during renaming:', error);
    } finally {
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}

renameCollections();