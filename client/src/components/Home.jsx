import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayerContext } from '../App';
import './Home.css';

function Home() {
  const [roomId, setRoomId] = useState('');
  const { playerName, setPlayerName } = useContext(PlayerContext);
  const navigate = useNavigate();

  const createRoom = async () => {
    if (!playerName) {
      alert('Please enter your name');
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/create-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      navigate(`/room/${data.roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    }
  };

  const joinRoom = () => {
    if (!playerName) {
      alert('Please enter your name');
      return;
    }
    if (roomId) {
      navigate(`/room/${roomId}`);
    } else {
      alert('Please enter a room ID');
    }
  };

  return (
    <div className="home-container">
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Enter your name"
        className="input-field"
      />
      <button onClick={createRoom} className="button create-button">Create Room</button>
      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter Room ID"
        className="input-field"
      />
      <button onClick={joinRoom} className="button join-button">Join Room</button>
    </div>
  );
}

export default Home;