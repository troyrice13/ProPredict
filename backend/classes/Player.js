class Player {
    constructor(playerData) {
        this.id = playerData.id;
        this.full_name = playerData.full_name;
        this.team = playerData.team;
        this.position = playerData.primary_position;
        this.stats = playerData.stats || {};
        this.height = playerData.height;
        this.weight = playerData.weight;
        this.birthdate = playerData.birthdate;
        this.age = this.calculateAge(playerData.birthdate);
        this.lastUpdated = playerData.lastUpdated || null;  // Timestamp for when stats were last updated
    }

    calculateAge(birthdate) {
        const birthDate = new Date(birthdate);
        const diff = Date.now() - birthDate.getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    async fetchStats(apiKey, playersCollection) {
        const axios = require('axios');

        // Check if stats are stale (older than 24 hours)
        const now = new Date();
        const lastUpdated = new Date(this.lastUpdated);
        const hoursSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60);  // Convert time difference to hours

        if (hoursSinceUpdate < 24) {
            console.log(`Using cached stats for ${this.full_name}`);
            return;
        }

        try {
            const response = await axios.get(`https://api.sportradar.com/mlb/trial/v7/en/players/${this.id}/profile.json?api_key=${apiKey}`);
            this.stats = response.data;
            this.lastUpdated = new Date();  // Update the lastUpdated timestamp

            // Save updated stats back to MongoDB
            await playersCollection.updateOne(
                { _id: this.id },
                { $set: { stats: this.stats, lastUpdated: this.lastUpdated } },
                { upsert: true }
            );

        } catch (err) {
            console.error(`Error fetching stats for ${this.full_name}`, err);
        }
    }

    calculateTrend() {
        if (!this.stats || !this.stats.seasons || this.stats.seasons.length === 0) {
            console.error(`No seasons data available for ${this.full_name}`);
            return 0;  // Return a default value or handle this case appropriately
        }
    
        const recentGames = this.stats.seasons.slice(-5); // Last 5 games
        const totalPerformance = recentGames.reduce((acc, game) => acc + (game.totals?.statistics?.hitting?.overall?.avg || 0), 0);
        return totalPerformance / recentGames.length;
    }

    predictNextGame() {
        const trend = this.calculateTrend();
        return trend * 1.05;  // Simple trend-based prediction
    }
}

module.exports = Player;
