const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;

async function migrateData() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('Cluster-1');
        const oldPlayersCollection = db.collection('players');
        const newPlayersCollection = db.collection('new_players');
        const seasonsCollection = db.collection('seasons');

        // Get all players from the old collection
        const players = await oldPlayersCollection.find({}).toArray();

        console.log(`Found ${players.length} players to migrate`);

        for (const player of players) {
            const playerInfo = player.stats?.player || {};

            // Extract basic player info for the new players collection
            const newPlayerData = {
                _id: playerInfo.id || player._id,
                full_name: playerInfo.full_name || player.full_name,
                first_name: playerInfo.first_name,
                last_name: playerInfo.last_name,
                preferred_name: playerInfo.preferred_name,
                jersey_number: playerInfo.jersey_number,
                position: playerInfo.position,
                primary_position: playerInfo.primary_position,
                height: playerInfo.height,
                weight: playerInfo.weight,
                throw_hand: playerInfo.throw_hand,
                bat_hand: playerInfo.bat_hand,
                birthdate: playerInfo.birthdate,
                birthcountry: playerInfo.birthcountry,
                birthcity: playerInfo.birthcity,
                pro_debut: playerInfo.pro_debut,
                team: playerInfo.team,
                updated: playerInfo.updated
            };

            // Insert into new players collection
            await newPlayersCollection.updateOne(
                { _id: newPlayerData._id },
                { $set: newPlayerData },
                { upsert: true }
            );

            // Extract season data
            if (playerInfo.seasons && Array.isArray(playerInfo.seasons)) {
                for (const season of playerInfo.seasons) {
                    const seasonData = {
                        playerId: newPlayerData._id,
                        year: season.year?.$numberInt || season.year,
                        type: season.type,
                        stats: season.totals,
                        lastUpdated: new Date()
                    };

                    // Insert into seasons collection
                    await seasonsCollection.updateOne(
                        { playerId: seasonData.playerId, year: seasonData.year, type: seasonData.type },
                        { $set: seasonData },
                        { upsert: true }
                    );
                }
            } else {
                console.log(`No season data for player ${newPlayerData.full_name} (${newPlayerData._id})`);
            }
        }

        console.log('Migration completed successfully');

        // Rename collections
        console.log('Renaming collections...');
        await db.collection('players').rename('old_players');
        await db.collection('new_players').rename('players');
        console.log('Collections renamed successfully');

    } catch (error) {
        console.error('Error during migration or renaming:', error);
    } finally {
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}

migrateData();