import { useEffect, useRef } from "react";
import { useUI } from "@/context/UiContext";

export default function SigilRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { tema } = useUI();
  const isEstrangeiro = tema === "estrangeiro";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    ctx.fillStyle = isEstrangeiro ? "rgb(2, 10, 5)" : "rgb(22, 10, 3)";
    ctx.fillRect(0, 0, width, height);

    const chars = "abcdefghijklmnopqrstuvwxy";
    const fontSize = 28;
    const columns = width / fontSize;
    const drops = Array(Math.floor(columns)).fill(0).map(() =>
      Math.floor(Math.random() * (height / fontSize))
    );

    const fontFamily = isEstrangeiro
      ? "'estrangeiro', monospace"
      : "'sigilos_do_outro_ladoregular', monospace";

    const draw = () => {
      ctx.fillStyle = isEstrangeiro
        ? "rgba(2, 10, 5, 0.3)"
        : "rgba(22, 10, 3, 0.3)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px ${fontFamily}`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];

        ctx.shadowBlur = 20;
        ctx.shadowColor = isEstrangeiro ? "#22c55e" : "#fde047";

        ctx.fillStyle = isEstrangeiro
          ? "rgba(74, 222, 128, 0.9)"
          : "rgba(253, 224, 71, 0.9)";
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        ctx.fillStyle = isEstrangeiro ? "#dcfce7" : "#fef3c6";
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
  }, [isEstrangeiro]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 hidden lg:block opacity-60 pointer-events-none" />;
}