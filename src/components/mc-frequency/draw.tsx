import { MstTheme } from "less/theme";

const draw = (stream: MediaStream, canvas: HTMLCanvasElement): void => {
  const audio = new AudioContext();
  const source = audio.createMediaStreamSource(stream);
  const analyser = audio.createAnalyser();
  const context = canvas.getContext("2d");
  source.connect(analyser);

  if (context) {
    const width = canvas.width;
    const height = canvas.height;
    const count = width / 4;
    const voice = new Uint8Array(analyser.frequencyBinCount);
    const color = context.createLinearGradient(0, 0, 0, height);
    color.addColorStop(0, MstTheme.mc_danger_color);
    color.addColorStop(0.5, MstTheme.mc_warning_color);
    color.addColorStop(0.7, MstTheme.mc_primary_color);
    color.addColorStop(1, MstTheme.mc_green_color);

    const _draw = () => {
      window.requestAnimationFrame(_draw);
      analyser.getByteFrequencyData(voice);
      context.clearRect(0, 0, width, height);

      const step = Math.floor(voice.length / count);
      const unit = height / 255;
      for (let i = 0; i < count; i++) {
        const freq = voice[step * i];
        context.fillStyle = color;
        context.fillRect(i * 6, height, 4, -freq * unit);
      }
    };

    _draw();
  }
};

export default draw;
