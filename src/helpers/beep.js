function beep(audioCX) {
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

export default beep
