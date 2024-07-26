import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import GameRoom from './components/GameRoom';
import './App.css';

export const PlayerContext = React.createContext();

function App() {
  const [playerName, setPlayerName] = useState('');

  return (
    <Router>
      <PlayerContext.Provider value={{ playerName, setPlayerName }}>
        <div className="App">
          <h1 className="app-title">DrawGuess</h1>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomId" element={<GameRoom />} />
          </Routes>
        </div>
      </PlayerContext.Provider>
    </Router>
  );
}

export default App;