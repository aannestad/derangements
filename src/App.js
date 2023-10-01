import React, { useState, useEffect, useRef, useCallback } from 'react';
import { animated, useSprings } from 'react-spring';
import { Button, Typography, Box, TextField } from '@mui/material';
import './App.css';

function shuffleArray(array) {
  let shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function isDerangement(original, shuffled) {
  return original.every((val, idx) => val !== shuffled[idx]);
}

function DerangementSim() {
  const [boardSize, setBoardSize] = useState(2);
  const [elements, setElements] = useState([...Array(boardSize * boardSize).keys()]);
  const [shuffledElements, setShuffledElements] = useState(() => shuffleArray(elements));
  const [isDeranged, setIsDeranged] = useState(() => isDerangement(elements, shuffledElements));
  
  const getMarbleSize = (number) => {
    const baseSize = 30; // Base size for one digit
    return `${baseSize + String(number).length * 10}px`; // Increment size for each additional digit
  };

  const getFontSize = (number) => {
    return `${20 + String(number).length}px`; // Adjust the font size dynamically
  };

  const boardRef = useRef(null); 
  
  const getSpringProps = useCallback((index) => {
    if (!boardRef.current) return { top: 0, left: 0 };
    const rect = boardRef.current.getBoundingClientRect();
    const marbleSize = rect.width / boardSize;
    const row = Math.floor(index / boardSize);
    const col = index % boardSize;
    return { top: row * marbleSize, left: col * marbleSize };
  }, [boardSize]);

  const [springs, setSprings] = useSprings(elements.length, index => getSpringProps(index));

  const shuffle = () => {
    const newShuffledElements = shuffleArray(elements);
    setShuffledElements(newShuffledElements);
    setIsDeranged(isDerangement(elements, newShuffledElements));
    
    setSprings(index => {
      const newProps = getSpringProps(newShuffledElements.indexOf(elements[index]));
      return {
        to: async (next) => {
          await next({ ...newProps, transform: 'scale(1)' });
        },
        from: { ...newProps, transform: 'scale(1.1)' },
        config: { tension: 170, friction: 12, mass: 1 },
        reset: true,
      };
    });
  };
  

  useEffect(() => {
    const newElements = [...Array(boardSize * boardSize).keys()];
    setElements(newElements);
    const newShuffledElements = shuffleArray(newElements);
    setShuffledElements(newShuffledElements);
    setIsDeranged(isDerangement(newElements, newShuffledElements));
    setSprings(index => getSpringProps(newShuffledElements.indexOf(newElements[index])));
  }, [boardSize, getSpringProps]);

  return (
    <div className="App p-6">
      <header className="App-header">
        <Typography variant="h4" gutterBottom>
          Derangement Simulator
        </Typography>
        <TextField
          label="Board Size"
          type="number"
          value={boardSize}
          onChange={e => setBoardSize(Number(e.target.value))}
          variant="outlined"
          className="mb-4"
        />
        <Button variant="contained" onClick={shuffle} className="mb-4">
          Shuffle
        </Button>


        <Box 
          className="relative w-64 h-64"
          ref={boardRef}
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
            gridTemplateRows: `repeat(${boardSize}, 1fr)`,
          }}    
        >

      {springs.map((props, index) => (
        <animated.div
        key={shuffledElements[index]}
        style={{
          ...props,
      

          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'gray',
          fontSize: getFontSize(shuffledElements[index] + 1),
          width: 'clamp(30px, 4vw, 60px)',
          height: 'clamp(30px, 4vw, 60px)',
        }}
      >
        {shuffledElements[index] + 1}
        </animated.div>
      ))}
        </Box>
      {isDeranged ? <p>This is a Derangement</p> : <p>This is not a Derangement</p>}
      </header>
      
    </div>
  );
}

function App() {
  return <DerangementSim />;
}

export default App;