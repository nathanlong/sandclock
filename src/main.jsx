import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
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
  const sand = useRef(null)
  const sandTop = useRef(null)
  const sandBottom = useRef(null)

  // map a value from 37 to 0 hue, 56 to 72 sat
  const hue = timePercent * 37
  const saturation = (56 - (56-72)) + (timePercent * (56-72))

  // convert our seconds into minutes:seconds
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = Math.floor(timeLeft % 60).toString().padStart(2, '0');

  // set up audio context on first render
  if (!audioCX.current) {
    audioCX.current = new AudioContext();
  }

  useInterval(() => {
    sand.current.style.setProperty('--speed', '1000ms')
    if (timeLeft > 0) {
      setTimeLeft(timeLeft - 1);
      document.title = minutes + ":" + seconds
    } else {
      beep()
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

    sand.current.style.setProperty('--speed', '150ms')
    setTimeStart(timeValue)
    setTimeLeft(timeValue)
    setIsRunning(false)
  }

  function handleFlip() {
    const timeElapsed = timeLeft
    const timeReversed = timeStart - timeLeft 
    sand.current.style.setProperty('--speed', '150ms')
    setTimeLeft(timeReversed)
  }

  function handleToggle() {
    if (isRunning) {
      sand.current.style.setProperty('--hue', 175)
      sand.current.style.setProperty('--saturation', '62%')
      sand.current.style.setProperty('--speed', '150ms')
      setIsRunning(false)
    } else {
      if (timeLeft === 0) {
        sand.current.style.setProperty('--speed', '150ms');
        setTimeLeft(timeStart)
      }
      setIsRunning(true)
    }
  }

  function beep() {
    // Cmaj9/E = E3 161.82, C4 256.87, D4 288.33, G4 384.87, B4 484.90
    // https://pages.mtu.edu/~suits/notefreq432.html
    const tone1 = audioCX.current.createOscillator()
    const tone2 = audioCX.current.createOscillator()
    const tone3 = audioCX.current.createOscillator()
    const tone4 = audioCX.current.createOscillator()
    const tone5 = audioCX.current.createOscillator()
    tone1.type = 'triangle'
    tone2.type = 'triangle'
    tone3.type = 'triangle'
    tone4.type = 'triangle'
    tone5.type = 'triangle'
    tone1.frequency.setValueAtTime(161.82, audioCX.current.currentTime)
    tone2.frequency.setValueAtTime(256.87, audioCX.current.currentTime)
    tone3.frequency.setValueAtTime(288.33, audioCX.current.currentTime)
    tone4.frequency.setValueAtTime(384.87, audioCX.current.currentTime)
    tone5.frequency.setValueAtTime(484.90, audioCX.current.currentTime)

    // keep it from getting muddy
    const compressor = audioCX.current.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-70, audioCX.current.currentTime);
    compressor.knee.setValueAtTime(10, audioCX.current.currentTime);
    compressor.ratio.setValueAtTime(70, audioCX.current.currentTime);
    compressor.attack.setValueAtTime(0, audioCX.current.currentTime);
    compressor.release.setValueAtTime(0.25, audioCX.current.currentTime)

    // fade out
    const jumpGain = audioCX.current.createGain()
    jumpGain.gain.setValueAtTime(20, audioCX.current.currentTime)
    jumpGain.gain.exponentialRampToValueAtTime(0.001, audioCX.current.currentTime + 4)

    // connect it all
    tone1.connect(compressor)
    tone2.connect(compressor)
    tone3.connect(compressor)
    tone4.connect(compressor)
    tone5.connect(compressor)
    compressor.connect(jumpGain)
    jumpGain.connect(audioCX.current.destination)

    // stagger chord
    tone1.start(audioCX.current.currentTime)
    tone1.stop(audioCX.current.currentTime + 4)
    tone2.start(audioCX.current.currentTime + 0.10)
    tone2.stop(audioCX.current.currentTime + 4)
    tone3.start(audioCX.current.currentTime + 0.20)
    tone3.stop(audioCX.current.currentTime + 4)
    tone4.start(audioCX.current.currentTime + 0.30)
    tone4.stop(audioCX.current.currentTime + 4)
    tone5.start(audioCX.current.currentTime + 0.40)
    tone5.stop(audioCX.current.currentTime + 4)
  }

  return (
    <>
      <div className="sandclock" ref={sand} style={{'--hue': hue, '--saturation': saturation + "%"}}>
        <div className="phial phial__top">
          <div className="sand sand__top" ref={sandTop} style={{'--percent': timePercent}}></div>
        </div>
        <div className="phial phial__bottom">
          <div className="sand sand__bottom" ref={sandBottom} style={{'--percent': 1 - timePercent}}></div>
        </div>

      </div>

      <div className="time-display">
        <p className="time-display__readout">{minutes}:{seconds}</p>
      </div>

      <form className="time-input" action="" onSubmit={handleSubmit}>
        <input id="timeEntry" className="time-input__input time-input__minutes" name="minutes" type="number" placeholder="0" />:
        <input id="timeEntry" className="time-input__input time-input__seconds" name="seconds" type="number" placeholder="00" />
        <button type="submit">Set</button>
      </form>

      <div className="start-stop">
        <button className="start-stop__toggle" onClick={handleToggle}>
          { isRunning ? 'Stop' : 'Start'}
        </button>
      </div>

      <button className="flip" onClick={handleFlip}>Flip</button>
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


function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min) // The maximum is exclusive and the minimum is inclusive
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
