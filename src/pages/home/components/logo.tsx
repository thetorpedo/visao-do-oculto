import { useEffect, useState } from "react";

const GLITCH_MIN_INTERVAL = 2000;
const GLITCH_MAX_INTERVAL = 6000;
const GLITCH_MIN_DURATION = 300;
const GLITCH_MAX_DURATION = 150;

export default function Logo({ char }: { char: string }) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextGlitch = () => {
      const delay = GLITCH_MIN_INTERVAL + Math.random() * (GLITCH_MAX_INTERVAL - GLITCH_MIN_INTERVAL);
      timeoutId = setTimeout(() => {
        setIsGlitching(true);
        const duration = GLITCH_MIN_DURATION + Math.random() * GLITCH_MAX_DURATION;
        timeoutId = setTimeout(() => {
          setIsGlitching(false);
          scheduleNextGlitch();
        }, duration);
      }, delay);
    };

    scheduleNextGlitch();
    return () => clearTimeout(timeoutId);
  }, []);

  if (char === " ") return <span>&nbsp;</span>;

  const displayChar = char === "Ã" && isGlitching ? "a" : char;

  return (
    <span className="relative inline-block">
      <span className="pointer-events-none font-special opacity-0">{char}</span>
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-75 ${isGlitching
          ? "font-sigilos -mt-2 text-amber-950/60 [text-shadow:0_0_10px_#fde047,0_0_30px_#ca8a04]"
          : "font-typewriter-bad text-black"
          }`}
      >
        {displayChar}
      </span>
    </span>
  );
}