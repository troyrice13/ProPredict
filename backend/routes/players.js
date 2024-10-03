app.get('/api/players', async (req, res) => {
    try {
        const db = client.db('Cluster-1');
        const playersCollection = db.collection('players');
        const players = await playersCollection.find({}).toArray();  // Fetch all players
        res.json(players);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching players', error: error.message });
    }
});
