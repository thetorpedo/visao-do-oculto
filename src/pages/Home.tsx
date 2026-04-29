import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import conhecimento from '@/public/img/conhecimento.webp';

function ParanormalChar({ char }: { char: string }) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let glitchDurationId: NodeJS.Timeout;

    const scheduleNextGlitch = () => {
      // Tempo que a letra fica NORMAL (entre 2 e 8 segundos)
      const timeToNextGlitch = Math.random() * 6000 + 2000;

      timeoutId = setTimeout(() => {
        setIsGlitching(true);

        // Tempo que a letra fica COMO SIGILO (muito rápido, entre 50ms e 200ms)
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
          isGlitching ? 'font-sigilos text-zinc-400' : 'font-special text-white'
        }`}
      >
        {char}
      </span>
    </span>
  );
}

export default function Home() {
  const title = "Visão do Oculto";

  return (
    <div className='relative overflow-hidden bg-[url(https://imgur.com/Gr98Hjt.jpg)] bg-cover bg-center text-white min-h-screen'>
      
      <img 
        src={conhecimento} 
        alt="Conhecimento" 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] animate-[spin_60s_linear_infinite] opacity-30 pointer-events-none select-none z-0" 
      />

      <div className="relative z-10 w-full max-w-4xl h-screen flex items-center justify-center flex-col gap-6 mx-auto px-4 text-center">
        
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