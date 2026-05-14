import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, Search, X } from "lucide-react"; // <-- Importados os ícones para o Mobile

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

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-60 pointer-events-none" />;
}


export default function FolderLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  
  // Estado do menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Trava o scroll da página quando o menu mobile está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  // Links para facilitar a renderização do menu mobile
  const navLinks = [
    { to: "/", label: "INÍCIO" },
    { to: "/origens", label: "ORIGENS" },
    { to: "/poderes", label: "PODERES" },
    { to: "/trilhas", label: "TRILHAS" },
    { to: "/equipamentos", label: "EQUIPAMENTOS" },
  ];

  return (
    <div className="relative overflow-hidden bg-black bg-[radial-gradient(#5b4f21_1px,transparent_1px)] bg-size-[16px_16px] min-h-screen flex-col justify-center items-center">
      <SigilRain />

      {/* ================= HEADER MOBILE ================= */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-[#837156] bg-[url(/assets/folder.jpg)] bg-blend-overlay bg-size-[30%] backdrop-blur-md  border-dashed border-[#837156] z-50 flex justify-between items-center p-4 shadow-xl">
      <span className="relative">
        <span className="relative z-99 font-special text-xl text-black tracking-widest p-2 bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] uppercase">Visão do Oculto
        </span>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(rgba(79,79,79,0.2),rgba(79,79,79,0.2)),url(/assets/paper.png)] bg-repeat bg-size-[30%] w-[97%] h-[95%] rotate-4 shadow-[0_0_40px_rgba(0,0,0,0.25)] p-1 z-11">
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(rgba(109,109,109,0.2),rgba(109,109,109,0.2)),url(/assets/paper.png)] bg-repeat bg-size-[30%] w-[97%] h-[95%] rotate-[-3.5deg] shadow-[0_0_40px_rgba(0,0,0,0.25)] p-1 z-11">
              </div>
      </span>

      <span className="space-x-4">
        
        <button onClick={() => window.dispatchEvent(new Event("open-global-search"))} className="text-black p-1 relative">
          <Search className="relative size-8 z-99 bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] " />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(rgba(79,79,79,0.2),rgba(79,79,79,0.2)),url(/assets/paper.png)] bg-repeat bg-size-[30%] w-[97%] h-[95%] rotate-4 shadow-[0_0_40px_rgba(0,0,0,0.25)] p-1 z-11">
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(rgba(109,109,109,0.2),rgba(109,109,109,0.2)),url(/assets/paper.png)] bg-repeat bg-size-[30%] w-[97%] h-[95%] rotate-[-3.5deg] shadow-[0_0_40px_rgba(0,0,0,0.25)] p-1 z-11">
              </div>
        </button>
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-black p-1 relative">
          <Menu className="relative size-8 z-99 bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] " />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(rgba(79,79,79,0.2),rgba(79,79,79,0.2)),url(/assets/paper.png)] bg-repeat bg-size-[30%] w-[97%] h-[95%] rotate-4 shadow-[0_0_40px_rgba(0,0,0,0.25)] p-1 z-11">
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(rgba(109,109,109,0.2),rgba(109,109,109,0.2)),url(/assets/paper.png)] bg-repeat bg-size-[30%] w-[97%] h-[95%] rotate-[-3.5deg] shadow-[0_0_40px_rgba(0,0,0,0.25)] p-1 z-11">
              </div>
        </button>
        </span>
      </div>

      {/* ================= MENU OVERLAY MOBILE ================= */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-[#160a03]/95 backdrop-blur-lg flex flex-col items-center justify-center animate-in fade-in duration-200">
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="absolute top-6 right-6 text-[#fde047] p-2 hover:rotate-90 transition-transform"
          >
            <X className="size-10" />
          </button>
          <div className="flex flex-col gap-8 text-center w-full px-6">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `
                  font-special text-4xl uppercase tracking-wider py-4 border-b-2 border-dashed border-[#5b4f21] transition-colors
                  ${isActive ? 'text-white bg-[#5b4f21]/20' : 'text-[#fde047]/70 hover:text-[#fde047]'}
                `}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* ================= PASTA PRINCIPAL ================= */}
      {/* Ajustado: w-[95%] mt-24 no mobile, w-4/5 mt-20 no desktop */}
      <div className="w-[95%] lg:w-4/5 -mb-1 mx-auto opacity-99 shadow-2xl/90 mt-24 lg:mt-20 relative z-10 pb-8">
        
        {/* === ABAS DESKTOP (Escondidas no mobile) === */}
        <div className="hidden lg:flex flex-row -gap-2 relative z-0">
          <NavLink to="/" className={({ isActive }: { isActive: boolean }) => `font-special bg-[url(/assets/folder.jpg)] bg-blend-overlay bg-size-[170%] w-60  -mt-8 rounded-t-lg flex justify-center items-start text-black/70 text-2xl pt-4 transition-all hover:-mt-12 hover:h-16 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.35)] z-9 ${isActive ? 'bg-[#837156] h-14 -mt-10 shadow-[0_0_15px_rgba(0,0,0,0.35)]' : 'bg-[#7a6a51] h-12 shadow-[inset_0_-2px_5px_rgba(0,0,0,0.35),0_0px_20px_rgba(0,0,0,0.55)]'}`}>
            INÍCIO
          </NavLink>
          <NavLink to="/origens" className={({ isActive }: { isActive: boolean }) => `font-special bg-[url(/assets/folder.jpg)] bg-blend-overlay bg-size-[170%] w-60  -mt-8 rounded-t-lg flex justify-center items-start text-black/70 text-2xl pt-4 transition-all -ml-5 hover:-mt-12 hover:h-16 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.35)] z-8 ${isActive ? 'bg-[#837156] h-14 -mt-10 shadow-[0_0_15px_rgba(0,0,0,0.35)] z-20' : 'bg-[#7a6a51] h-12 shadow-[inset_0_-2px_5px_rgba(0,0,0,0.35),0_0px_20px_rgba(0,0,0,0.55)]'}`}>
            ORIGENS
          </NavLink> 
          <NavLink to="/poderes" className={({ isActive }: { isActive: boolean }) => `font-special bg-[url(/assets/folder.jpg)] bg-blend-overlay bg-size-[170%] w-60  -mt-8 rounded-t-lg flex justify-center items-start text-black/70 text-2xl pt-4 transition-all -ml-5 hover:-mt-12 hover:h-16 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.35)] z-7 ${isActive ? 'bg-[#837156] h-14 -mt-10 shadow-[0_0_15px_rgba(0,0,0,0.35)] z-20' : 'bg-[#7a6a51] h-12 shadow-[inset_0_-2px_5px_rgba(0,0,0,0.35),0_0px_20px_rgba(0,0,0,0.55)]'}`}>
            PODERES
          </NavLink> 
          <NavLink to="/trilhas" className={({ isActive }: { isActive: boolean }) => `font-special bg-[url(/assets/folder.jpg)] bg-blend-overlay bg-size-[170%] w-60  -mt-8 rounded-t-lg flex justify-center items-start text-black/70 text-2xl pt-4 transition-all -ml-5 hover:-mt-12 hover:h-16 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.35)] z-6 ${isActive ? 'bg-[#837156] h-14 -mt-10 shadow-[0_0_15px_rgba(0,0,0,0.35)] z-20' : 'bg-[#7a6a51] h-12 shadow-[inset_0_-2px_5px_rgba(0,0,0,0.35),0_0px_20px_rgba(0,0,0,0.55)]'}`}>
            TRILHAS
          </NavLink> 
          <NavLink to="/equipamentos" className={({ isActive }: { isActive: boolean }) => `font-special bg-[url(/assets/folder.jpg)] bg-blend-overlay bg-size-[170%] w-60  -mt-8 rounded-t-lg flex justify-center items-start text-black/70 text-2xl pt-4 transition-all -ml-5 hover:-mt-12 hover:h-16 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.35)] z-5 ${isActive ? 'bg-[#837156] h-14 -mt-10 shadow-[0_0_15px_rgba(0,0,0,0.35)] z-20' : 'bg-[#7a6a51] h-12 shadow-[inset_0_-2px_5px_rgba(0,0,0,0.35),0_0px_20px_rgba(0,0,0,0.55)]'}`}>
            EQUIPAM.
          </NavLink> 
        </div>
          
        {/* === CORPO DA PASTA === */}
        {/* No mobile, adicionei rounded-t-lg já que não temos as abas visíveis no topo */}
        <div className="bg-[#837156] bg-[url(/assets/folder.jpg)] bg-blend-overlay bg-size-[30%] w-full h-8 relative z-10 rounded-t-md lg:rounded-t-none"></div>
        <div className="relative bg-[#837156] bg-[url(/assets/folder.jpg)] bg-blend-overlay bg-size-[30%] h-full p-2 sm:p-6 lg:p-6 ">
          
          {isHome && (
            <>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(rgba(79,79,79,0.2),rgba(79,79,79,0.2)),url(/assets/paper.png)] bg-repeat bg-size-[30%] w-[97%] h-[95%] rotate-1 shadow-[0_0_40px_rgba(0,0,0,0.25)] p-1 z-11">
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(rgba(109,109,109,0.2),rgba(109,109,109,0.2)),url(/assets/paper.png)] bg-repeat bg-size-[30%] w-[97%] h-[95%] rotate-[-0.5deg] shadow-[0_0_40px_rgba(0,0,0,0.25)] p-1 z-11">
              </div>
            </>
          )}
                
          <div className={`relative ${isHome ? ' bg-[linear-gradient(rgba(229,229,229,0.5),rgba(229,229,229,0.5)),url(/assets/paper.png)] ' : 'bg-none shadow-none'} bg-repeat bg-size-[30%] w-full h-full shadow-[0_0_15px_rgba(0,0,0,0.15)] z-12`}>
            <div className="w-full h-full">
              <Outlet />
            </div>
          </div>
        </div>  
      </div>
        
    </div>
  );
}