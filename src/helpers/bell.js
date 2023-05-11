function bell(audioCX) {
  const attack = 50;
  const bellParams = {
    nOsc: 14,
    pitchModifier: 0.975, // e4 ..?
    duration: 3,
    F: [
      97.0362, 155.7461, 200.6708, 291.5601, 335.2872, 401.6002, 500.6919,
      599.8203, 679.0558, 704.6314, 850.3987, 1016.353, 1169.165, 1343.452,
    ],
    Slope: [
      -0.71286, -1.08551, -2.68134, -0.80383, -5.88471, -1.06387, -3.419,
      -3.69923, -6.71634, -3.57097, -6.85307, -7.04044, -5.6755, -7.25273,
    ],
    Amp0: [
      -55.7976, -44.8857, -33.3415, -70.8675, -24.9633, -75.653, -27.2338,
      -66.8294, -23.635, -57.3287, -43.0425, -50.9267, -55.1784, -46.6498,
    ],
  };

  audioCX.current.resume();
  let gNode = [];
  let osc = [];
  let now = audioCX.current.currentTime;

  for (let i = 0; i < bellParams.nOsc; i++) {
    gNode[i] = audioCX.current.createGain();
    osc[i] = audioCX.current.createOscillator();
    osc[i].type = "sine";
    osc[i].start();
    osc[i].connect(gNode[i]).connect(audioCX.current.destination);
  }

  for (let i = 0; i < bellParams.nOsc; i++) {
    osc[i].frequency.setValueAtTime(
      bellParams.pitchModifier * bellParams.F[i],
      now
    );
    gNode[i].gain.setValueAtTime(0.001, now);
    gNode[i].gain.setValueAtTime(
      DBToAmp(bellParams.Amp0[i]) * 5,
      now + attack / 1000
    );
    let FinalAmp = DBToAmp(
      bellParams.Amp0[i] + (bellParams.Slope[i] * 2) / bellParams.duration
    );
    gNode[i].gain.exponentialRampToValueAtTime(FinalAmp, now + 2);
    gNode[i].gain.linearRampToValueAtTime(0, now + 4);
  }
}

function DBToAmp(db) {
  return Math.pow(10, db / 20);
}

export default bell;
