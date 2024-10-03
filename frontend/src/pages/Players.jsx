import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, useNavigate } from 'react-router-dom';
import PlayerStats from './Stats';

function App() {
  const [players, setPlayers] = useState([]);  // To store list of players
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch players from the backend
    axios.get('http://localhost:5000/api/players')
      .then(response => {
        const sortedPlayers = response.data.sort((a, b) => 
          a.full_name.localeCompare(b.full_name)
        );  // Sort players by their full name
        setPlayers(sortedPlayers);  // Set the sorted players in the state
      })
      .catch(error => {
        console.error('Error fetching player data:', error);
      });
  }, []);

  // Navigate to the player's stats page when a player is clicked
  const handlePlayerClick = (playerId) => {
    navigate(`/stats/${playerId}`);  // This will route to the PlayerStats component
  };

  return (
    <div>
      <h1>Player List</h1>
      <ul>
        {players.map(player => (
          <li key={player._id} onClick={() => handlePlayerClick(player._id)}>
            {player.full_name}
          </li>
        ))}
      </ul>

      <Routes>
        <Route path="/stats/:id" element={<PlayerStats />} />  
      </Routes>
    </div>
  );
}

export default App;
