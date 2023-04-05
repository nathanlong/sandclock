import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import './App.css'

// TODO:
// - Convert time from seconds to minutes
// - Create intuitive time entry method

function App() {
  const audioCX = useRef(null)
  const canvas = useRef(null)
  const canvasCX = useRef(null)
  const [timeStart, setTimeStart] = useState(90);
  const [timeLeft, setTimeLeft] = useState(90);
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

  if (!canvas.current) {
    canvas.current = document.createElement("canvas");
    canvasCX.current = canvas.current.getContext("2d");
    grain(canvas.current, canvasCX.current, 256, "--grain-square-black", "hsla(0, 100%, 0%, 1)");
    grain(canvas.current, canvasCX.current, 256, "--grain-square-white-opacity-blend", "hsla(25, 100%, 96%, 0.1375)");
    grain(canvas.current, canvasCX.current, 256, "--grain-square-white-opacity-strong", "hsla(25, 100%, 96%, 0.4)");
  }

  useInterval(() => {
    sand.current.style.setProperty('--speed', delay + 'ms')
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
    // Cmaj9/E+1 = E4 323.63, C5 513.74, D5 576.65, G5 769.74, B5 969.81
    // https://pages.mtu.edu/~suits/notefreq432.html
    const tone1 = audioCX.current.createOscillator()
    const tone2 = audioCX.current.createOscillator()
    const tone3 = audioCX.current.createOscillator()
    const tone4 = audioCX.current.createOscillator()
    const tone5 = audioCX.current.createOscillator()
    tone1.type = 'sine'
    tone2.type = 'sine'
    tone3.type = 'sine'
    tone4.type = 'sine'
    tone5.type = 'sine'
    tone1.frequency.setValueAtTime(323.63, audioCX.current.currentTime)
    tone2.frequency.setValueAtTime(513.74, audioCX.current.currentTime)
    tone3.frequency.setValueAtTime(576.65, audioCX.current.currentTime)
    tone4.frequency.setValueAtTime(769.74, audioCX.current.currentTime)
    tone5.frequency.setValueAtTime(969.81, audioCX.current.currentTime)

    // keep it from getting muddy
    const compressor = audioCX.current.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-70, audioCX.current.currentTime);
    compressor.knee.setValueAtTime(10, audioCX.current.currentTime);
    compressor.ratio.setValueAtTime(20, audioCX.current.currentTime);
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

  function grain(canvas, ctx, size, name, color) {
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = color;

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (Math.random() > 0.5) {
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);

      document.documentElement.style.setProperty(name, `url(${url})`);
    });
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
        <input id="timeEntry" className="time-input__input time-input__minutes" name="minutes" type="number" placeholder="0" />
        <span className="time-input__separator">:</span>
        <input id="timeEntry" className="time-input__input time-input__seconds" name="seconds" type="number" placeholder="00" />
        <button className="time-input__button" type="submit">Set</button>
      </form>

      <button className="control start-stop" onClick={handleToggle}>
        <svg className={isRunning ? 'icon hidden' : 'icon visible'} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>play</title><path d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg>
        <svg className={isRunning ? 'icon visible' : 'icon hidden'} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14,19H18V5H14M6,19H10V5H6V19Z" /></svg>
        { isRunning ? 'Stop' : 'Start'}
      </button>

      <button className="control flip" onClick={handleFlip}>
        <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13,4.07V1L8.45,5.55L13,10V6.09C15.84,6.57 18,9.03 18,12C18,14.97 15.84,17.43 13,17.91V19.93C16.95,19.44 20,16.08 20,12C20,7.92 16.95,4.56 13,4.07M7.1,18.32C8.26,19.22 9.61,19.76 11,19.93V17.9C10.13,17.75 9.29,17.41 8.54,16.87L7.1,18.32M6.09,13H4.07C4.24,14.39 4.79,15.73 5.69,16.89L7.1,15.47C6.58,14.72 6.23,13.88 6.09,13M7.11,8.53L5.7,7.11C4.8,8.27 4.24,9.61 4.07,11H6.09C6.23,10.13 6.58,9.28 7.11,8.53Z" /></svg>
        Flip
      </button>

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
