import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RoomJoin = () => {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const createRoom = async () => {
    const response = await fetch('/api/create-room', { method: 'POST' });
    const { roomId } = await response.json();
    navigate(`/room/${roomId}`);
  };

  const joinRoom = () => {
    if (roomId) {
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <div>
      <button onClick={createRoom}>Create Room</button>
      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter Room ID"
      />
      <button onClick={joinRoom}>Join Room</button>
    </div>
  );
};

export default RoomJoin;