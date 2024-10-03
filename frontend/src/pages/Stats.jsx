import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function Stats() {
    const { id: playerId } = useParams();  // Get playerId from URL
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (playerId) {
            axios.get(`http://localhost:5000/api/player/${playerId}`)
                .then(res => {
                    setPlayerData(res.data.player);  // Access the nested player data
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error getting player data", err);
                    setError("Error fetching player data");
                    setLoading(false);
                });
        }
    }, [playerId]);

    if (loading) {
        return <p>Loading player data...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h1>Player Stats</h1>
            {playerData ? (
                <div>
                    <h2>{playerData.full_name}</h2>
                    <p>Team: {playerData.team.name}</p>
                    <p>Position: {playerData.primary_position}</p>
                    <p>Bat Hand: {playerData.bat_hand}</p>
                    <p>Jersey Number: {playerData.jersey_number}</p>
                    {/* Add more player details as needed */}
                </div>
            ) : (
                <p>No player data found</p>
            )}
        </div>
    );
}
