import React, { useRef, useEffect, useState } from 'react';
import './DrawingBoard.css';

function DrawingBoard({ socket, isDrawing, roomId }) {
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#000000');
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const handleMouseDown = (e) => {
      if (!isDrawing) return;
      setIsMouseDown(true);
      const { offsetX, offsetY } = e;
      context.beginPath();
      context.moveTo(offsetX, offsetY);
      drawLine(offsetX, offsetY);
    };

    const handleMouseMove = (e) => {
      if (!isDrawing || !isMouseDown) return;
      const { offsetX, offsetY } = e;
      drawLine(offsetX, offsetY);
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
      context.beginPath();
    };

    const drawLine = (x, y) => {
      console.log('Drawing line to', x, y);
      context.lineTo(x, y);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.stroke();
      socket.emit('draw', { roomId, x, y, color });
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseUp);

    socket.on('draw', ({ x, y, color }) => {
      console.log('Received draw event', x, y, color);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.lineTo(x, y);
      context.stroke();
      context.beginPath();
      context.moveTo(x, y);
    });

    socket.on('clear canvas', () => {
      console.log('Clearing canvas');
      context.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseout', handleMouseUp);
      socket.off('draw');
      socket.off('clear canvas');
    };
  }, [socket, color, isDrawing, roomId]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear canvas', { roomId });
  };

  return (
    <div className="drawing-board">
      <canvas ref={canvasRef} width={600} height={400} className="canvas" />
      {isDrawing && (
        <div className="controls">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="color-picker"
          />
          <button onClick={clearCanvas} className="clear-button">Clear</button>
        </div>
      )}
      <div>{isDrawing ? 'You can draw' : 'You cannot draw'}</div>
    </div>
  );
}

export default DrawingBoard;