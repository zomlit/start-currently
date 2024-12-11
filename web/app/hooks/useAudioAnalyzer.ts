interface AudioAnalyzerOptions {
  fftSize: number;
  minDecibels: number;
  maxDecibels: number;
  smoothing: number;
}

export function useAudioAnalyzer(options: AudioAnalyzerOptions) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();

  // Configure analyzer
  analyser.fftSize = options.fftSize;
  analyser.minDecibels = options.minDecibels;
  analyser.maxDecibels = options.maxDecibels;
  analyser.smoothingTimeConstant = options.smoothing;

  // Create data array for frequency data
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  // Update frequency data
  function updateData() {
    analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  return {
    analyser,
    dataArray,
    updateData,
    audioContext,
  };
}
