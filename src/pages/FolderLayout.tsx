import { useEffect, useRef } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

function SigilRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-60" />;
}


export default function FolderLayout() {

  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="relative overflow-hidden bg-black bg-[radial-gradient(#5b4f21_1px,transparent_1px)] bg-size-[16px_16px] min-h-screen flex-col justify-center items-center">
      <SigilRain />
     
        <div className="max-w-4/5 -mb-1 mx-auto opacity-99 shadow-2xl/90 mt-20">
          <div className="flex flex-row -gap-2 relative z-0">
            <NavLink to="/" className={({ isActive }: { isActive: boolean }) => `font-special bg-[url(src/assets/folder.jpg)] bg-blend-overlay bg-size-[170%] w-60  -mt-8 rounded-t-lg flex justify-center items-start text-black/70 text-2xl pt-4 transition-all hover:-mt-12 hover:h-16 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.35)] z-9 ${isActive ? 'bg-[#837156] h-14 -mt-10 shadow-[0_0_15px_rgba(0,0,0,0.35)]' : 'bg-[#7a6a51] h-12 shadow-[inset_0_-2px_5px_rgba(0,0,0,0.35),0_0px_20px_rgba(0,0,0,0.55)]'}`}>
              INÍCIO
            </NavLink>
            <NavLink to="/origens" className={({ isActive }: { isActive: boolean }) => `font-special bg-[url(src/assets/folder.jpg)] bg-blend-overlay bg-size-[170%] w-60  -mt-8 rounded-t-lg flex justify-center items-start text-black/70 text-2xl pt-4 transition-all -ml-5 hover:-mt-12 hover:h-16 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.35)] z-8 ${isActive ? 'bg-[#837156] h-14 -mt-10 shadow-[0_0_15px_rgba(0,0,0,0.35)] z-20' : 'bg-[#7a6a51] h-12 shadow-[inset_0_-2px_5px_rgba(0,0,0,0.35),0_0px_20px_rgba(0,0,0,0.55)]'}`}>
              ORIGENS
            </NavLink> 
            <NavLink to="/poderes" className={({ isActive }: { isActive: boolean }) => `font-special bg-[url(src/assets/folder.jpg)] bg-blend-overlay bg-size-[170%] w-60  -mt-8 rounded-t-lg flex justify-center items-start text-black/70 text-2xl pt-4 transition-all -ml-5 hover:-mt-12 hover:h-16 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.35)] z-7 ${isActive ? 'bg-[#837156] h-14 -mt-10 shadow-[0_0_15px_rgba(0,0,0,0.35)] z-20' : 'bg-[#7a6a51] h-12 shadow-[inset_0_-2px_5px_rgba(0,0,0,0.35),0_0px_20px_rgba(0,0,0,0.55)]'}`}>
              PODERES
            </NavLink> 
            <NavLink to="/trilhas" className={({ isActive }: { isActive: boolean }) => `font-special bg-[url(src/assets/folder.jpg)] bg-blend-overlay bg-size-[170%] w-60  -mt-8 rounded-t-lg flex justify-center items-start text-black/70 text-2xl pt-4 transition-all -ml-5 hover:-mt-12 hover:h-16 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.35)] z-6 ${isActive ? 'bg-[#837156] h-14 -mt-10 shadow-[0_0_15px_rgba(0,0,0,0.35)] z-20' : 'bg-[#7a6a51] h-12 shadow-[inset_0_-2px_5px_rgba(0,0,0,0.35),0_0px_20px_rgba(0,0,0,0.55)]'}`}>
              TRILHAS
            </NavLink> 
            <NavLink to="/equipamento" className={({ isActive }: { isActive: boolean }) => `font-special bg-[url(src/assets/folder.jpg)] bg-blend-overlay bg-size-[170%] w-60  -mt-8 rounded-t-lg flex justify-center items-start text-black/70 text-2xl pt-4 transition-all -ml-5 hover:-mt-12 hover:h-16 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.35)] z-5 ${isActive ? 'bg-[#837156] h-14 -mt-10 shadow-[0_0_15px_rgba(0,0,0,0.35)] z-20' : 'bg-[#7a6a51] h-12 shadow-[inset_0_-2px_5px_rgba(0,0,0,0.35),0_0px_20px_rgba(0,0,0,0.55)]'}`}>
              EQUIPAM.
            </NavLink> 
            <NavLink to="/rituais" className={({ isActive }: { isActive: boolean }) => `font-special bg-[url(src/assets/folder.jpg)] bg-blend-overlay bg-size-[170%] w-60  -mt-8 rounded-t-lg flex justify-center items-start text-black/70 text-2xl pt-4 transition-all -ml-5 hover:-mt-12 hover:h-16 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.35)] z-4 ${isActive ? 'bg-[#837156] h-14 -mt-10 shadow-[0_0_15px_rgba(0,0,0,0.35)] z-20' : 'bg-[#7a6a51] h-12 shadow-[inset_0_-2px_5px_rgba(0,0,0,0.35),0_0px_20px_rgba(0,0,0,0.55)]'}`}>
              RITUAIS
            </NavLink> 
          </div>
          
          <div className="bg-[#837156] bg-[url(src/assets/folder.jpg)] bg-blend-overlay bg-size-[30%] w-full h-8 relative z-10"></div>
          <div className="relative bg-[#837156] bg-[url(src/assets/folder.jpg)] bg-blend-overlay bg-size-[30%] h-full p-6 ">
          {isHome && (<>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(rgba(79,79,79,0.2),rgba(79,79,79,0.2)),url(src/assets/paper.png)] bg-repeat bg-size-[30%] w-[97%] h-[95%] rotate-1 shadow-[0_0_40px_rgba(0,0,0,0.25)] p-1 z-11">
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(rgba(109,109,109,0.2),rgba(109,109,109,0.2)),url(src/assets/paper.png)] bg-repeat bg-size-[30%] w-[97%] h-[95%] rotate-[-0.5deg] shadow-[0_0_40px_rgba(0,0,0,0.25)] p-1 z-11">
            </div>
          </>)}
                
                <div className={`relative ${isHome ? ' bg-[linear-gradient(rgba(229,229,229,0.5),rgba(229,229,229,0.5)),url(src/assets/paper.png)] ' : 'bg-none shadow-none'} bg-repeat bg-size-[30%] w-full h-full shadow-[0_0_15px_rgba(0,0,0,0.15)] z-12`}>
                <div className="w-full h-full">
                  <Outlet />
                </div>
              </div>
          </div>  
        </div>
        
    </div>
  );
}