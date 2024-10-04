import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css';
import Stats from './pages/Stats';
import Players from './pages/Players';

function App() {

  return (
    <Routes>
      <Route path="/stats/:id" element={<Stats />} />
      <Route path="/players/*" element={<Players />} />
    </Routes>
  )
}

export default App
