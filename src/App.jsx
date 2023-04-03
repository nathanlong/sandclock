import { useState, useEffect, useRef } from 'react'
import './App.css'


function App() {
  const [inputValue, setInputValue] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10)
  const [intervalID, setIntervalID] = useState(null);

  function setTimer() {
    let id = useInterval(() => {
      setTimeLeft(timeLeft => timeLeft - 1);
      console.log(timeLeft)
    }, 1000)
  }

  function clearTimer() {
    clearInterval(intervalID);
  }

  function test() {
    console.log(intervalID);
  }

  function handleInputChange(event) {
    setInputValue(event.target.value);
    setTimeLeft(event.target.value);
  }

  return (
    <div className="App">
      <h1>SandClock</h1>
      <div className="card">
        <input type="number" value={inputValue} onChange={handleInputChange} />
        <p>{timeLeft}</p>
        <button onClick={setTimer}>
          Start
        </button>
        <button onClick={clearTimer}>Stop</button>
        <button onClick={test}>Test</button>
      </div>
    </div>
  )
}

//https://overreacted.io/making-setinterval-declarative-with-react-hooks/
function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default App
