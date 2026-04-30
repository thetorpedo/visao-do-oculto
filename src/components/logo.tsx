import { useEffect, useState } from "react";

export default function Logo({ char }: { char: string }) {
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
              ? 'font-sigilos -mt-2 text-amber-950/60 [text-shadow:0_0_10px_#fde047,0_0_30px_#ca8a04]'
              : 'font-typewriter-bad text-black'
          }`}
        >
          {char === 'Ã' && isGlitching ? 'a' : char}
        </span>
      </span>
    );
  }