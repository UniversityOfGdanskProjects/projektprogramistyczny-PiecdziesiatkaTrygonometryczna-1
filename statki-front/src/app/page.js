'use client';
import { useState, useEffect } from 'react';
import { Formik, Field } from 'formik';

export default function Home() {
  const [boardSize, setBoardSize] = useState(35);
  const [islandCount, setIslandCount] = useState(100);
  const board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
  const [message, setMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  const [shipCoordinates, setShipCoordinates] = useState(null);
  const [islands, setIslands] = useState([]);
  const [direction, setDirection] = useState('');

  const handleArrowCommandSequence = (command) => {
    setMessage('');
    moveShip(command);
  };
  
  const checkPath = (commandSequence) => {
    let tempCoordinates = { ...shipCoordinates };
  
    for (let command of commandSequence) {
      switch (command) {
        case 'w':
          tempCoordinates.y = Math.max(tempCoordinates.y - 1, 0);
          break;
        case 's':
          tempCoordinates.y = Math.min(tempCoordinates.y + 1, boardSize - 1);
          break;
        case 'd':
          tempCoordinates.x = Math.min(tempCoordinates.x + 1, boardSize - 1);
          break;
        case 'a':
          tempCoordinates.x = Math.max(tempCoordinates.x - 1, 0);
          break;
        default:
          break;
      }
  
      if (islands.some((island) => island.x === tempCoordinates.x && island.y === tempCoordinates.y)) {
        return true;
      }
    }
  
    return false;
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowUp':
          setCommandSequence('w');
          handleArrowCommandSequence('w');
          break;
        case 'ArrowLeft':
          setCommandSequence('a');
          handleArrowCommandSequence('a');
          break;
        case 'ArrowDown':
          setCommandSequence('s');
          handleArrowCommandSequence('s');
          break;
        case 'ArrowRight':
          setCommandSequence('d');
          handleArrowCommandSequence('d');
          break;
        default:
          break;
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleArrowCommandSequence]);

  useEffect(() => {
    if (!gameStarted) return;

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
      while (islands.length < islandCount) {
        const x = Math.floor(Math.random() * boardSize);
        const y = Math.floor(Math.random() * boardSize);
        if ((x !== shipCoordinates.x || y !== shipCoordinates.y) && !islands.some((island) => island.x === x && island.y === y)) {
          islands.push({ x, y });
        }
      }
      return islands;
    };
  
    if (islands.length !== islandCount) {
      setIslands(generateIslands());
    }
  
    return () => {
      clearInterval(timer);
    };
  }, [direction, boardSize, gameStarted, islandCount]);


  const [commandSequence, setCommandSequence] = useState('');

  const moveShip = (commandSequence) => {
    let newCoordinates = { ...shipCoordinates };
    let message = '';
  
    for (let command of commandSequence) {
      let tempCoordinates = { ...newCoordinates };
  
      switch (command) {
        case 'w':
          tempCoordinates.y = Math.max(tempCoordinates.y - 1, 0);
          break;
        case 's':
          tempCoordinates.y = Math.min(tempCoordinates.y + 1, boardSize - 1);
          break;
        case 'd':
          tempCoordinates.x = Math.min(tempCoordinates.x + 1, boardSize - 1);
          break;
        case 'a':
          tempCoordinates.x = Math.max(tempCoordinates.x - 1, 0);
          break;
        default:
          break;
      }
  
      if (islands.some((island) => island.x === tempCoordinates.x && island.y === tempCoordinates.y)) {
        message = 'Land detected! Cancelling move.';
        break;
      }
  
      newCoordinates = tempCoordinates;
    }

    if (message) {
      setMessage(message);
    }
  
    setShipCoordinates(newCoordinates);
    setCommandSequence('');
  };
  
  
  
  

  const saveToFile = () => {
    const data = JSON.stringify({ shipCoordinates, islands, boardSize });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'map.json';
    link.href = url;
    link.click();
  };
  
  const loadFromFile = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = JSON.parse(event.target.result);
      setShipCoordinates(data.shipCoordinates);
      setIslands(data.islands);
      setBoardSize(data.boardSize);
      setGameStarted(true); // Rozpocznij grę po wczytaniu pliku
    };
    reader.readAsText(file);
  };

  const handleFormCommandSequence = (values, { resetForm }) => {
    setMessage('');
    if (!checkPath(values.commandSequence)) {
      moveShip(values.commandSequence);
    } else {
      setMessage('Land detected in path! Cancelling move.');
    }
    resetForm();
  };

  const startGame = (x, y, boardSize, islandCount) => {
    if (x > 34 || y > 34) {
      setMessage('X and Y cannot be greater than 34.');
      return;
    }
  
    if (boardSize > 45) {
      setMessage('Board size cannot be greater than 45.');
      return;
    }
  
    if (islandCount > (boardSize * boardSize - 1)) {
      setMessage(`For board size ${boardSize}, island count cannot be greater than ${(boardSize * boardSize) - 1}.`);
      return;
    }
  
    setShipCoordinates({ x: Number(x), y: Number(y) });
    setBoardSize(Number(boardSize));
    setIslandCount(Number(islandCount));
    setGameStarted(true);
  };

  if (!gameStarted) {
    return (
        <div className="centerContent">
        <h1>Witaj w grze Statki na morzu! Wybierz punkt początkowy, ilość wysep, lub wczytaj grę z pliku!</h1>
        <input type="number" min="0" max={boardSize - 1} onChange={(e) => setStartX(e.target.value)} placeholder="X" /> 
        <input type="number" min="0" max={boardSize - 1} onChange={(e) => setStartY(e.target.value)} placeholder="Y" /> 
        <input type="number" min="1" max={boardSize * boardSize - 1} onChange={(e) => setIslandCount(e.target.value)} placeholder="Liczba wysep" />
        <button onClick={() => startGame(startX, startY, boardSize, islandCount)}>Start Game</button>
        <input type="file" onChange={loadFromFile} />
        <p>{message}</p>
      </div>
    );
  }


return (
  <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div style={{ position: 'absolute', top: 0, left: 0 }}>
      <p>Ship Coordinates: {shipCoordinates.x}, {shipCoordinates.y}</p>
    </div>
    <Formik initialValues={{ commandSequence: '' }} onSubmit={handleFormCommandSequence}>
      {({ handleSubmit, handleChange, values }) => (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="commandSequence"
            value={values.commandSequence}
            onChange={handleChange}
          />
          <button type="submit">Move</button>
        </form>
      )}
    </Formik>
    <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', textAlign: 'center', padding: '10px', background: 'rgba(255, 255, 255, 0.9)' }}>
      <p>{message}</p>
    </div>
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

    <button className="saveToFile" onClick={saveToFile}>Save Game to File</button>
    <input type="file" onChange={loadFromFile} />
    <button className="exitGame" onClick={() => setGameStarted(false)}>Exit Game</button>
  </main>
);
}