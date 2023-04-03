import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './App.css'

// TODO:
// - Convert time from seconds to minutes
// - Create intuitive time entry method

function App() {
  const audioCX = useRef(null)
  const [timeStart, setTimeStart] = useState(10);
  const [timeLeft, setTimeLeft] = useState(10);
  const [delay, setDelay] = useState(1000);
  const [isRunning, setIsRunning] = useState(false);
  const timePercent = timeLeft/timeStart;
  const sandTop = useRef(null)
  const sandBottom = useRef(null)

  // map a value from 37 to 356 hue, 56 to 72 sat
  const hue = 0 + (timePercent * (37))
  const saturation = (56 - (56-72)) + (timePercent * (56-72))

  // convert our seconds into minutes:seconds
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = Math.floor(timeLeft % 60).toString().padStart(2, '0');

  // set up audio context on first render
  // if (!audioCX.current) {
  //   audioCX.current = new AudioContext();
  // }

  useInterval(() => {
    sandTop.current.style.setProperty('--speed', '1000ms')
    sandBottom.current.style.setProperty('--speed', '1000ms')
    if (timeLeft > 0) {
      setTimeLeft(timeLeft - 1);
      document.title = minutes + ":" + seconds
    } else {
      setIsRunning(false)
      document.title = "SandClock"
    }
  }, isRunning ? delay : null);

  function handleSubmit(event) {
    event.preventDefault();
    const setMinutes = event.target.minutes.value !== '' ? parseInt(event.target.minutes.value) : 0
    const setSeconds = event.target.seconds.value !== '' ? parseInt(event.target.seconds.value) : 0
    const timeValue = setMinutes * 60 + setSeconds

    if (timeValue === 0) {
      return
    }

    setTimeStart(timeValue)
    setTimeLeft(timeValue)
    setIsRunning(false)
  }

  function handleFlip() {
    const timeElapsed = timeLeft
    const timeReversed = timeStart - timeLeft 
    sandTop.current.style.setProperty('--speed', '150ms')
    sandBottom.current.style.setProperty('--speed', '150ms')
    setTimeLeft(timeReversed)

    if (!isRunning) {
      setIsRunning(true)
    }
  }

  return (
    <>
      <div className="sandclock">
        <div className="phial phial__top">
          <div className="sand sand__top" ref={sandTop} style={{'--percent': timePercent, '--hue': hue, '--saturation': saturation + "%"}}></div>
        </div>
        <div className="phial phial__bottom">
          <div className="sand sand__bottom" ref={sandBottom} style={{'--percent': 1 - timePercent, '--hue': hue, '--saturation': saturation + "%"}}></div>
        </div>
      </div>

      <div className="time-display">
        <p className="time-display__readout">{minutes}:{seconds}</p>
      </div>

      <form className="time-input" action="" onSubmit={handleSubmit}>
        <input id="timeEntry" className="time-input__input time-input__minutes" name="minutes" type="number" placeholder="0" />:
        <input id="timeEntry" className="time-input__input time-input__seconds" name="seconds" type="number" placeholder="00" />
        <button type="submit">Set Time</button>
      </form>

      <div className="control-start-stop">
        <button onClick={() => setIsRunning(true)}>Start</button>
        <button onClick={() => setIsRunning(false)}>Stop</button>
      </div>

      <button className="control-flip" onClick={handleFlip}>Flip</button>
    </>
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
      return () => {
        clearInterval(id);
      }
    }
  }, [delay]);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
