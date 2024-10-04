import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function Stats() {
    const { id: playerId } = useParams();  
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (playerId) {
            axios.get(`http://localhost:5000/api/player/${playerId}`)
                .then(res => {
                    setPlayerData(res.data);
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

    const playerInfo = playerData?.playerInfo || {};
    const teamInfo = playerInfo.team || {};
    const hittingStats = playerData?.playerStats?.stats?.statistics?.hitting?.overall || {};

    return (
        <div>
            <h1>Player Stats</h1>
            {playerInfo ? (
                <div>
                    <h2>{playerInfo.full_name || 'N/A'}</h2>
                    <p>Team: {teamInfo.name || 'N/A'}</p>
                    <p>Position: {playerInfo.primary_position || 'N/A'}</p>
                    <p>Height: {playerInfo.height ? `${playerInfo.height} inches` : 'N/A'}</p>
                    <p>Weight: {playerInfo.weight ? `${playerInfo.weight} lbs` : 'N/A'}</p>
                    <p>Birthdate: {playerInfo.birthdate || 'N/A'}</p>
                    
                    <h3>2024 Regular Season Stats</h3>
                    <p>At Bats (AB): {hittingStats.ab || 'N/A'}</p>
                    <p>Hits: {hittingStats.onbase?.h || 'N/A'}</p>
                    <p>Home Runs (HR): {hittingStats.onbase?.hr || 'N/A'}</p>
                    <p>RBIs: {hittingStats.rbi || 'N/A'}</p>
                    <p>Batting Average (AVG): {hittingStats.avg || 'N/A'}</p>
                    <p>On-base plus Slugging (OPS): {hittingStats.ops || 'N/A'}</p>

                    <h3>Next Game Prediction</h3>
                    <p>Next Game Prediction: {playerInfo.projection || 'N/A'}</p>
                </div>
            ) : (
                <p>No player data found</p>
            )}
        </div>
    );
}