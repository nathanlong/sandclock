function beep(audioCX) {
  // Cmaj9/E+1 = E4 323.63, C5 513.74, D5 576.65, G5 769.74, B5 969.81
  // https://pages.mtu.edu/~suits/notefreq432.html
  const chord = ["323.63", "513.74", "576.65", "769.74", "969.81"];
  const randomTone = Math.floor(Math.random() * chord.length);

  // build oscillator
  const tone1 = audioCX.current.createOscillator();
  tone1.type = "sine";
  tone1.frequency.setValueAtTime(
    chord[randomTone],
    audioCX.current.currentTime
  );

  //convolver reverb
  const convolver = audioCX.current.createConvolver();

  // Grab audio track via XHR for convolver node
  let soundSource;
  let ajaxRequest = new XMLHttpRequest();

  ajaxRequest.open("GET", "/audio/waves.mp3", true);
  ajaxRequest.responseType = "arraybuffer";
  ajaxRequest.onload = function () {
    const audioData = ajaxRequest.response;
    audioCX.current.decodeAudioData(
      audioData,
      function (buffer) {
        soundSource = audioCX.current.createBufferSource();
        convolver.buffer = buffer;
      },
      function (e) {
        console.log("Error with decoding audio data" + e.err);
      }
    );
  };
  ajaxRequest.send();

  // fade out
  const jumpGain = audioCX.current.createGain();
  jumpGain.gain.setValueAtTime(1.5, audioCX.current.currentTime);
  jumpGain.gain.exponentialRampToValueAtTime(
    0.001,
    audioCX.current.currentTime + 5
  );

  // connect it all
  tone1.connect(convolver);
  convolver.connect(jumpGain);
  jumpGain.connect(audioCX.current.destination);

  // play
  tone1.start(audioCX.current.currentTime);
  tone1.stop(audioCX.current.currentTime + 5);
}

export default beep;
