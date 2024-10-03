import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css';
import PlayerStats from './components/PlayerStats';

function App() {

  return (
    <Routes>
      <Route path="/stats/:id" element={<PlayerStats />} />
    </Routes>
  )
}

export default App
