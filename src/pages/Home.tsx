import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function SigilRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const chars = "abcdefghijklmnopqrstuvwxyABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const fontSize = 28;
    const columns = width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

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
        ctx.shadowBlur = 0;
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

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-60" />;
}

function ParanormalChar({ char }) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const scheduleNextGlitch = () => {
      const timeToNextGlitch = Math.random() * 6000 + 2000;
      const timeoutId = setTimeout(() => {
        setIsGlitching(true);
        setTimeout(() => {
          setIsGlitching(false);
          scheduleNextGlitch();
        }, Math.random() * 150 + 300);
      }, timeToNextGlitch);
      return timeoutId;
    };

    const id = scheduleNextGlitch();
    return () => clearTimeout(id);
  }, []);

  if (char === " ") return <span>&nbsp;</span>;

  return (
    <span className="relative inline-block">
      <span className="opacity-0 font-special pointer-events-none">{char}</span>
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-75 ${
          isGlitching
            ? 'font-sigilos -mt-2 text-amber-100 [text-shadow:0_0_10px_#fde047,0_0_30px_#ca8a04]'
            : 'font-typewriter-bad text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'
        }`}
      >
        {char === 'Ã' && isGlitching ? 'a' : char}
      </span>
    </span>
  );
}

export default function Home() {
  const title = "VISÃO DO OCULTO";

  return (
    <div className="relative overflow-hidden bg-[#000] text-white min-h-screen flex-col justify-center items-center h-screen">
      <SigilRain />

      <div className="absolute inset-0 bg-[radial-gradient(#a95905_1px,transparent_1px)] bg-size-[32px_32px] opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl flex items-center justify-center flex-col gap-2 mx-auto px-4 text-center">
        <img src='src\assets\39.png' className="absolute top-1/2 left-1/2 brightness-0 opacity-90 -translate-x-1/2 -translate-y-1/2 w-[98%] h-92 pointer-events-none select-none z-0 drop-shadow-[0_0_50px_rgba(254,_209,_48,_0.1)] "/>

        <div className="flex flex-col justify-center items-center gap-0 p-10 shadow-2xl">
          <h1 className="text-5xl md:text-7xl flex flex-wrap mb-4 justify-center pointer-events-none select-none">
            {title.split("").map((char, index) => (
              <ParanormalChar key={index} char={char} />
            ))}
          </h1>

          <p className="text-lg font-special tracking-widest opacity-80 mt-4">
            Procure por origens, poderes, trilhas, equipamentos e rituais.
          </p>

          <div className="relative w-full max-w-lg mt-6">
            <Input
              placeholder="PESQUISAR ARQUIVOS..."
              className="bg-amber-950/20 border-amber-950 focus:border-amber-600 h-14 pl-4 tracking-widest uppercase font-special text-lg text-white placeholder:text-zinc-600"
            />
          </div>
        </div>
      </div>
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-center flex-col gap-2 mx-auto px-4 text-center">
        <div className="flex flex-row justify-between gap-2">
            <Link to='/origens' className="p-6 bg-black/90 font-daisy text-white">
              Origens
            </Link>
        </div>
      </div>
    </div>
  );
}