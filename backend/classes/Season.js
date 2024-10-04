class Season {
    constructor(seasonData) {
        this.playerId = seasonData.playerId;
        this.year = seasonData.year;
        this.type = seasonData.type; // e.g., 'REG' for regular season
        this.stats = seasonData.stats || {};
        this.lastUpdated = seasonData.lastUpdated || new Date();
    }

    async save(seasonsCollection) {
        await seasonsCollection.updateOne(
            { playerId: this.playerId, year: this.year, type: this.type },
            { $set: this },
            { upsert: true }
        );
    }
}

module.exports = Season;