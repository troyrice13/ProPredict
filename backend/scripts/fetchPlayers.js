// const { MongoClient } = require('mongodb');
// const axios = require('axios');
// const dotenv = require('dotenv');
// const path = require('path');

// dotenv.config();
// dotenv.config({ path: path.resolve(__dirname, '../.env') });

// const uri = process.env.MONGODB_URI;
// const client = new MongoClient(uri);

// const apiKey = process.env.SPORTRADAR_API_KEY;

// async function fetchAndStorePlayers() {
//     try {
//         await client.connect();
//         const db = client.db('Cluster-1');
//         const playersCollection = db.collection('players');

//         // Fetch depth chart data for player names and IDs
//         const response = await axios.get(`https://api.sportradar.us/mlb/trial/v7/en/league/depth_charts.json?api_key=${apiKey}`);
//         const teams = response.data.teams;

//         for (const team of teams) {
//             for (const position of team.positions) {
//                 for (const player of position.players) {
//                     const playerData = {
//                         _id: player.id,  // Use the player's ID as the MongoDB document _id
//                         full_name: player.full_name,
//                     };

//                     // Upsert player into the MongoDB collection
//                     await playersCollection.updateOne(
//                         { _id: player.id },
//                         { $set: playerData },
//                         { upsert: true }
//                     );
//                 }
//             }
//         }

//         console.log('All player names and IDs stored in MongoDB.');
//     } catch (error) {
//         console.error('Error fetching or storing player data', error);
//     } 
// }

// // Run the function to fetch and store player data (you can call this on server start or as needed)
// fetchAndStorePlayers();
