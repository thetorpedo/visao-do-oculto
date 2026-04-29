import box from '@/assets/box.png';
import conhecimento from '@/assets/conhecimento.webp';
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

function ParanormalChar({ char }: { char: string }) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let glitchDurationId: NodeJS.Timeout;

    const scheduleNextGlitch = () => {
      const timeToNextGlitch = Math.random() * 6000 + 2000;

      timeoutId = setTimeout(() => {
        setIsGlitching(true);

        const glitchDuration = Math.random() * 150 + 300;

        glitchDurationId = setTimeout(() => {
          setIsGlitching(false);
          scheduleNextGlitch();
        }, glitchDuration);

      }, timeToNextGlitch);
    };

    scheduleNextGlitch();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(glitchDurationId);
    };
  }, []);

  if (char === " ") return <span>&nbsp;</span>;

  return (
    <span className="relative inline-block">
      <span className="opacity-0 font-special pointer-events-none">
        {char}
      </span>

      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-75 ${
          isGlitching
            ? 'font-sigilos -mt-2 text-amber-100 drop-shadow-[0_0_4px_rgba(253,230,138,0.2)] [text-shadow:0_0_10px_#fde047,0_0_30px_#ca8a04]'
            : 'font-typewriter-bad text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'
        }`}
      >
        {char === 'ã' && isGlitching? 'a' : char}
      </span>
    </span>
  );
}

export default function Home() {
  const title = "Visão do Oculto";

  return (
    <div className='relative overflow-hidden bg-black text-white min-h-screen bg-[radial-gradient(#3d3d3d_1px,transparent_1px)] bg-size-[32px_32px]'>
      
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
      <div className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 size-120 bg-[radial-gradient(circle,theme(colors.amber.400)_0%,theme(colors.amber.500/0)_90%)] opacity-80 blur-3xl rounded-full" />
      <div className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 size-250 bg-[radial-gradient(circle,theme(colors.amber.900)_0%,theme(colors.amber.500/0)_90%)] opacity-80 blur-3xl rounded-full" />

        <img
          src={conhecimento}
          alt="Conhecimento"
          className="size-200 animate-[spin_60s_linear_infinite] opacity-70 select-none"
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl h-screen flex items-center justify-center flex-col gap-2 mx-auto px-4 text-center">

        <img
          src={box}
          alt="box"
          className="absolute top-1/2 left-1/2 skew-x-5 brightness-150 -translate-x-1/2 -translate-y-1/2 w-full h-100 pointer-events-none select-none z-0 drop-shadow-[0_0_80px_rgba(253,230,138,0.15)]"
        />
        <img
          src={box}
          alt="box"
          className="absolute top-1/2 left-1/2 skew-x-5 brightness-90 -translate-x-1/2 -translate-y-1/2 w-[98%] h-92 pointer-events-none select-none z-0 drop-shadow-[0_0_80px_rgba(253,230,138,0.15)]"
        />

        <h1 className="text-7xl md:text-8xl flex flex-wrap justify-center pointer-events-none select-none drop-shadow-lg">
          {title.split("").map((char, index) => (
            <ParanormalChar key={index} char={char} />
          ))}
        </h1>

        <p className='text-xl font-special tracking-widest opacity-80 uppercase drop-shadow-md'>
          Procure por origens, poderes, trilhas, equipamentos e rituais.
        </p>

        <div className="relative w-full max-w-lg mt-4">
          <Input
            placeholder='PESQUISAR ARQUIVOS...'
            className='bg-black/70 border-zinc-800 focus:border-red-600 h-14 tracking-widest uppercase font-special text-lg text-white placeholder:text-zinc-500'
          />
        </div>
      </div>

    </div>
  );
}