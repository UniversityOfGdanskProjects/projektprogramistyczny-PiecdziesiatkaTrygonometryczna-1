'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const boardSize = 30;
  const board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));

  const [shipCoordinates, setShipCoordinates] = useState({ x: 0, y: 0 });
  const [islands, setIslands] = useState([]);
  const [direction, setDirection] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setShipCoordinates((prev) => {
        let updatedCoordinates = { ...prev };
        switch (direction) {
          case 'N':
            updatedCoordinates = { x: prev.x, y: Math.max(prev.y - 1, 0) };
            break;
          case 'S':
            updatedCoordinates = { x: prev.x, y: Math.min(prev.y + 1, boardSize - 1) };
            break;
          case 'E':
            updatedCoordinates = { x: Math.min(prev.x + 1, boardSize - 1), y: prev.y };
            break;
          case 'W':
            updatedCoordinates = { x: Math.max(prev.x - 1, 0), y: prev.y };
            break;
          default:
            break;
        }
        return updatedCoordinates;
      });
    }, 1000);

    const generateIslands = () => {
      const islands = [];
      while (islands.length < 100) {
        const x = Math.floor(Math.random() * boardSize);
        const y = Math.floor(Math.random() * boardSize);
        if ((x !== 0 || y !== 0) && !islands.some((island) => island.x === x && island.y === y)) {
          islands.push({ x, y });
        }
      }
      return islands;
    };

    setIslands(generateIslands());

    return () => {
      clearInterval(timer);
    };
  }, [direction, boardSize]);


  const [commandSequence, setCommandSequence] = useState('');

  const moveShip = (newCoordinates) => {
    if (islands.some((island) => island.x === newCoordinates.x && island.y === newCoordinates.y)) {
      console.log('Land detected! Cancelling move.');
      return;
    }
    setShipCoordinates(newCoordinates);
  };
  
  const handleCommandSequence = (event) => {
    event.preventDefault();
    let newCoordinates = { ...shipCoordinates };
    for (let command of commandSequence) {
      switch (command) {
        case 'w':
          newCoordinates = { x: newCoordinates.x, y: Math.max(newCoordinates.y - 1, 0) };
          break;
        case 's':
          newCoordinates = { x: newCoordinates.x, y: Math.min(newCoordinates.y + 1, boardSize - 1) };
          break;
        case 'd':
          newCoordinates = { x: Math.min(newCoordinates.x + 1, boardSize - 1), y: newCoordinates.y };
          break;
        case 'a':
          newCoordinates = { x: Math.max(newCoordinates.x - 1, 0), y: newCoordinates.y };
          break;
        default:
          break;
      }
      if (islands.some((island) => island.x === newCoordinates.x && island.y === newCoordinates.y)) {
        console.log('Land detected! Cancelling move.');
        return;
      }
    }
    setShipCoordinates(newCoordinates);
    setCommandSequence('');
  };

return (
  <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div style={{ position: 'absolute', top: 0, left: 0 }}>
      <p>Ship Coordinates: {shipCoordinates.x}, {shipCoordinates.y}</p>
    </div>
    <form onSubmit={handleCommandSequence}>
      <input
        type="text"
        value={commandSequence}
        onChange={(event) => setCommandSequence(event.target.value)}
      />
      <button type="submit">Execute Command Sequence</button>
    </form>
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${boardSize}, 1fr)`, gap: '1px' }}>
      {board.map((row, i) =>
        row.map((cell, j) => (
          <div
            key={`${i}-${j}`}
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: islands.some((island) => island.x === j && island.y === i)
                ? 'green'
                : i === shipCoordinates.y && j === shipCoordinates.x
                ? 'grey'
                : 'lightblue',
            }}
          >
          </div>
        ))
      )}
    </div>
  </main>
);
}