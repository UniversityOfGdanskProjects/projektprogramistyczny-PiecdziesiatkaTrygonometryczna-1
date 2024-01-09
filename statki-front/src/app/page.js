'use client';
import { useState, useEffect, useLayoutEffect} from 'react';
import { Formik} from 'formik';

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
  const [showModal, setShowModal] = useState(false);


  useEffect(() => {
    if (gameStarted && message) {
      setShowModal(true);
    }
  }, [gameStarted, message]);

  const handleCloseModal = () => {
    setShowModal(false);
    setMessage('');
  };
  
  function Modal({ message, onClose }) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px'
        }}>
          <p>{message}</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }


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

  useLayoutEffect(() => {
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
        message = 'Próbujesz wpłynąć na wyspę! Powstrzymaliśmy Cię od tego...';
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
      setGameStarted(true);
    };
    reader.readAsText(file);
  };

  const handleFormCommandSequence = (values, { resetForm }) => {
    setMessage('');
    if (!checkPath(values.commandSequence)) {
      moveShip(values.commandSequence);
    } else {
      setMessage('Próbujesz wpłynąć na wyspę! Powstrzymaliśmy Cię od tego...');
    }
    resetForm();
  };

  const startGame = (x, y, boardSize, islandCount) => {
    if (x > 34 || y > 34) {
      setMessage('Koordynaty nie mogą być większe niż 34.');
      return;
    }
  
    if (boardSize > 45) {
      setMessage('Rozmiar planszy nie może być większy niż 45.');
      return;
    }
  
    if (islandCount > (boardSize * boardSize - 1)) {
      setMessage(`Dla rozmiaru planszy ${boardSize}, ilość wysp nie może być większa niż ${(boardSize * boardSize) - 1}.`);
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
        <h1>Witaj w grze Statki na morzu! Wybierz punkt początkowy, ilość wysp, lub wczytaj grę z pliku!</h1>
        <input type="number" min="0" max={boardSize - 1} onChange={(e) => setStartX(e.target.value)} placeholder="X" /> 
        <input type="number" min="0" max={boardSize - 1} onChange={(e) => setStartY(e.target.value)} placeholder="Y" /> 
        <input type="number" min="1" max={boardSize * boardSize - 1} onChange={(e) => setIslandCount(e.target.value)} placeholder="Liczba wysp" />
        <button onClick={() => startGame(startX, startY, boardSize, islandCount)}>Graj!</button>
        <input type="file" id="fileInput" style={{ display: 'none' }} onChange={loadFromFile} />
        <label htmlFor="fileInput" className="customButton">Wczytaj grę</label>
        <p>{message}</p>
      </div>
    );
  }


return (
  
  <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <div className="absolute">
      <p id="cords">Obecne koordynaty statku: ({shipCoordinates.x}, {shipCoordinates.y})</p>
    </div>
    </div>
    {showModal && <Modal message={message} onClose={handleCloseModal} />}
    <Formik initialValues={{ commandSequence: '' }} onSubmit={handleFormCommandSequence}>
      {({ handleSubmit, handleChange, values }) => (
        <form  id = "move_form" onSubmit={handleSubmit}>
          <input id ="move"
            type="text"
            name="commandSequence"
            value={values.commandSequence}
            onChange={handleChange}
          />
          <button type="submit">Płyń!</button>
        </form>
      )}
    </Formik>
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${boardSize}, 1fr)`, gap: '1px', backgroundColor: 'white' }}>
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
<div id="bottom-controls">
    <button className="saveToFile" onClick={saveToFile}>Zapisz grę</button>
    <input type="file" id="fileInput" style={{ display: 'none' }} onChange={loadFromFile} />
    <label htmlFor="fileInput" className="customButton">Wczytaj grę</label>
    <button className="exitGame" onClick={() => setGameStarted(false)}>Wyjdź z gry</button>
    </div>
  </main>
);
}