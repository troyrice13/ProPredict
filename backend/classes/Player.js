class Player {
    constructor(playerData) {
        this.id = playerData.id;
        this.full_name = playerData.full_name;
        this.team = playerData.team;
        this.position = playerData.primary_position;
        this.height = playerData.height;
        this.weight = playerData.weight;
        this.birthdate = playerData.birthdate;
        this.age = this.calculateAge(playerData.birthdate);
    }

    calculateAge(birthdate) {
        const birthDate = new Date(birthdate);
        const diff = Date.now() - birthDate.getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    async save(playersCollection) {
        await playersCollection.updateOne(
            { _id: this.id },
            { $set: this },
            { upsert: true }
        );
    }
}

module.exports = Player;