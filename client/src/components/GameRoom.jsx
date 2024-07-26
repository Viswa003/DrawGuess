import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { PlayerContext } from '../App';
import DrawingBoard from './DrawingBoard';
import Chat from './Chat';
import './GameRoom.css';

function GameRoom() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [timer, setTimer] = useState(60);
  const [players, setPlayers] = useState([]);
  const [currentDrawer, setCurrentDrawer] = useState('');
  const { roomId } = useParams();
  const { playerName } = useContext(PlayerContext);

  useEffect(() => {
    console.log('Connecting to socket...');
    const newSocket = io(import.meta.env.VITE_SERVER_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      newSocket.emit('join room', { roomId, playerName });
    });

    newSocket.on('room update', ({ players, currentDrawer }) => {
      console.log('Room update received', { players, currentDrawer });
      setPlayers(players);
      setCurrentDrawer(currentDrawer);
    });

    newSocket.on('new round', ({ drawer, word }) => {
      console.log('New round started', { drawer, word });
      setCurrentDrawer(drawer);
      setCurrentWord(newSocket.id === drawer ? word : '');
      setTimer(60);
    });

    newSocket.on('timer update', (time) => {
      setTimer(time);
    });

    newSocket.on('correct guess', ({ playerName, score }) => {
      console.log('Correct guess', { playerName, score });
      alert(`${playerName} guessed correctly! Their score is now ${score}`);
    });

    newSocket.on('error', (message) => {
      console.error('Error received:', message);
      alert(message);
    });

    return () => {
      console.log('Disconnecting socket');
      newSocket.disconnect();
    };
  }, [roomId, playerName]);

  if (!isConnected) {
    return <div>Connecting...</div>;
  }

  const isDrawing = socket && currentDrawer === socket.id;

  return (
    <div className="game-room">
      <div className="game-info">
        <h2>Room: {roomId}</h2>
        <div>Time left: {timer}s</div>
        <div>Current word: {currentWord || (isDrawing ? 'You are drawing!' : 'Guess the word!')}</div>
        <div>Current drawer: {players.find(p => p.id === currentDrawer)?.name || 'Waiting...'}</div>
      </div>
      <div className="game-area">
        <DrawingBoard socket={socket} isDrawing={isDrawing} roomId={roomId} />
        <Chat socket={socket} roomId={roomId} />
      </div>
      <div className="player-list">
        <h3>Players:</h3>
        <ul>
          {players.map((player) => (
            <li key={player.id}>{player.name}: {player.score}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default GameRoom;