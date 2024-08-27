import React, { useState } from 'react';
import './App.css';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="counter-container">
      <h2 className="counter-heading">Welcome to My React Counter!</h2>
      <p className="counter-count">You clicked {count} times</p>
      <div className="button-container">
        <button 
          className="button increment-button"
          onClick={() => setCount(count + 1)}
        >
          Click me
        </button>
        <button 
          className="button reset-button"
          onClick={() => setCount(0)}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default Counter;