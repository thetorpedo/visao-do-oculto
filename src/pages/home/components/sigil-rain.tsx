import { useEffect, useRef } from "react";

export default function SigilRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const chars = "abcdefghijklmnopqrstuvwxyABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const fontSize = 28;
    const columns = width / fontSize;
    const drops = Array(Math.floor(columns)).fill(0).map(() =>
      Math.floor(Math.random() * (height / fontSize))
    );

    const draw = () => {
      ctx.fillStyle = "rgba(22, 10, 3, 0.3)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px 'sigilos_do_outro_ladoregular', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];

        ctx.shadowBlur = 20;
        ctx.shadowColor = "#fde047";

        ctx.fillStyle = "rgba(253, 224, 71, 0.9)";
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        ctx.fillStyle = "#fef3c6";
        ctx.shadowBlur = 1;
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 60);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 hidden lg:block opacity-60 pointer-events-none" />;
}