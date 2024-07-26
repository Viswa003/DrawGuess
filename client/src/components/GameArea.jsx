import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import DrawingBoard from './DrawingBoard';
import Chat from './Chat';

const GameArea = () => {
  const [socket, setSocket] = useState(null);
  const [currentWord, setCurrentWord] = useState('');
  const [timer, setTimer] = useState(60);
  const { roomId } = useParams();

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SERVER_URL);
    setSocket(newSocket);

    newSocket.emit('join room', roomId);

    newSocket.on('new word', (word) => {
      setCurrentWord(word);
      setTimer(60);
    });

    newSocket.on('timer update', (time) => {
      setTimer(time);
    });

    return () => newSocket.close();
  }, [roomId]);

  if (!socket) {
    return <div>Connecting...</div>;
  }

  return (
    <div>
      <h2>Room: {roomId}</h2>
      <div>Time left: {timer}s</div>
      <div>Current word: {currentWord}</div>
      <DrawingBoard socket={socket} />
      <Chat socket={socket} />
    </div>
  );
};

export default GameArea;