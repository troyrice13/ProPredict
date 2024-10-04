class Player {
    constructor(playerData) {
        this.id = playerData.id;
        this.full_name = playerData.full_name;
        this.team = playerData.team;
        this.position = playerData.primary_position;
        this.stats = playerData.stats || {};
    }

    async fetchStats(apiKey) {
        const axios = require('axios');
        try {
            const response = await axios.get(`https://api.sportradar.com/mlb/trial/v7/en/players/${this.id}/profile.json?api_key=${apiKey}`);
            this.stats = response.data;
        } catch (err) {
            console.error(`Error fetching stats for ${this.full_name}`)
        }
    }

    calculateTrend() {
        const recentGames = this.stats.seasons.slice(-5);
        const totalPerformance = recentGames.reduce((acc, game) => acc + game.totals.statistics.hitting.overall.avg, 0);
        return totalPerformance / recentGames.length;
    }

    predictNextGame() {
        const trend = this.calculateTrend();
        return trend * 1.05;
    }
}

module.exports = Player