import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Players() {
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/players')
      .then(response => {
        const sortedPlayers = response.data.sort((a, b) => 
          a.full_name.localeCompare(b.full_name)
        );  
        setPlayers(sortedPlayers);  
      })
      .catch(error => {
        console.error('Error fetching player data:', error);
      });
  }, []);

  const handlePlayerClick = (playerId) => {
    navigate(`/stats/${playerId}`);  
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
    </div>
  );
}

export default Players;