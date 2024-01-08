'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const boardSize = 30;
  const board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));

  const [highlightedCell, setHighlightedCell] = useState({ x: 0, y: 0 });
  const [islands, setIslands] = useState([]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowUp':
          setHighlightedCell((prev) => ({ x: prev.x, y: Math.max(prev.y - 1, 0) }));
          break;
        case 'ArrowDown':
          setHighlightedCell((prev) => ({ x: prev.x, y: Math.min(prev.y + 1, boardSize - 1) }));
          break;
        case 'ArrowLeft':
          setHighlightedCell((prev) => ({ x: Math.max(prev.x - 1, 0), y: prev.y }));
          break;
        case 'ArrowRight':
          setHighlightedCell((prev) => ({ x: Math.min(prev.x + 1, boardSize - 1), y: prev.y }));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const generateIslands = () => {
      const islands = [];
      while (islands.length < 100) {
        const x = Math.floor(Math.random() * boardSize);
        const y = Math.floor(Math.random() * boardSize);
        if (!islands.some((island) => island.x === x && island.y === y)) {
          islands.push({ x, y });
        }
      }
      return islands;
    };

    setIslands(generateIslands());

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
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
                  : i === highlightedCell.y && j === highlightedCell.x
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