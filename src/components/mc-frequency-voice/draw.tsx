const draw = (stream: MediaStream, canvas: HTMLCanvasElement): void => {
  const audio = new AudioContext();
  const source = audio.createMediaStreamSource(stream);
  const analyser = audio.createAnalyser();
  const context = canvas.getContext("2d");
  source.connect(analyser);

  if (context) {
    const width = canvas.width;
    const height = canvas.height;
    const voice = new Uint8Array(analyser.frequencyBinCount);
    const color = context.createLinearGradient(0, 0, 0, height / 2);
    color.addColorStop(1, "#24D656");
    const count = width;

    const _draw = () => {
      window.requestAnimationFrame(_draw);
      analyser.getByteFrequencyData(voice);
      context.clearRect(0, 0, width, height);
      const step = Math.floor(voice.length / count);
      context.lineCap = "round";
      for (let i = 0; i < count; i++) {
        const freq = voice[step * i];
        context.fillStyle = color;

        //fillRect（x,y,width.height）-freq为渲染上方，freq渲染下方
        context.fillRect(width / 2 + i * 5, height / 2, 2, -freq / (height * 0.3));
        context.fillRect(width / 2 - i * 5, height / 2, 2, -freq / (height * 0.3));
        context.fillRect(width / 2 + i * 5, height / 2, 2, freq / (height * 0.3));
        context.fillRect(width / 2 - i * 5, height / 2, 2, freq / (height * 0.3));
      }
    };
    _draw();
  }
};

export default draw;
