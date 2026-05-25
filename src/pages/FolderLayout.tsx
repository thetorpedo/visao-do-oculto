import PaperStamp from "@/components/PaperStamp";
import SigilRain from "@/components/SigilRain";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "INÍCIO", z: "z-[9]", margin: "" },
  { to: "/origens", label: "ORIGENS", z: "z-[8]", margin: "-ml-5" },
  { to: "/poderes", label: "PODERES", z: "z-[7]", margin: "-ml-5" },
  { to: "/trilhas", label: "TRILHAS", z: "z-[6]", margin: "-ml-5" },
  { to: "/equipamentos", label: "EQUIPAM.", z: "z-[5]", margin: "-ml-5" },
  { to: "/rituais", label: "RITUAIS", z: "z-[4]", margin: "-ml-5" },
];

export default function FolderLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
  }, [isMobileMenuOpen]);

  return (
    <div className="relative overflow-hidden bg-[#453b13] lg:bg-black bg-[radial-gradient(#5b4f21_1px,transparent_1px)] bg-size-[16px_16px] min-h-screen flex-col justify-center items-center">
      <SigilRain />

      {/* ================= HEADER MOBILE ================= */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-[#837156] bg-[url(/assets/folder.jpg)] bg-blend-overlay bg-size-[30%] backdrop-blur-md  border-dashed border-[#837156] z-50 flex justify-between items-center p-4 shadow-xl">
        <span className="relative">
          <span className="relative z-99 font-special text-xl text-black tracking-widest p-2 bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] uppercase">
            Visão do Oculto
          </span>
          <PaperStamp />
        </span>

        <span className="space-x-4 flex items-center">
          <button onClick={() => window.dispatchEvent(new Event("open-global-search"))} className="text-black p-1 relative">
            <Search className="relative size-8 z-99 bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)]" />
            <PaperStamp />
          </button>
          
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-black p-1 relative">
            <Menu className="relative size-8 z-99 bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)]" />
            <PaperStamp />
          </button>
        </span>
      </div>

      {/* ================= MENU OVERLAY MOBILE ================= */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-60 bg-[#160a03]/95 backdrop-blur-lg flex flex-col items-center justify-center animate-in fade-in duration-200">
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="absolute top-6 right-6 text-[#fde047] p-2 hover:rotate-90 transition-transform"
          >
            <X className="size-10" />
          </button>
          <div className="flex flex-col gap-8 text-center w-full px-6">
            {NAV_LINKS.map(link => (
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
      <div className="w-[95%] lg:w-4/5 -mb-1 mx-auto opacity-99  mt-24 lg:mt-20 relative z-10 pb-8">
        
        {/* === ABAS DESKTOP === */}
        <div className="hidden lg:flex flex-row -gap-2 relative z-0">
          {NAV_LINKS.map((link) => (
            <NavLink 
              key={link.to} 
              to={link.to} 
              className={({ isActive }) => `
                font-special bg-[url(/assets/folder.jpg)] bg-blend-overlay bg-size-[170%] w-60 -mt-8 rounded-t-lg flex justify-center items-start text-black/70 text-2xl pt-4 transition-all hover:-mt-12 hover:h-16 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.35)] 
                ${link.z} ${link.margin} 
                ${isActive ? 'bg-[#837156] h-14 -mt-10 shadow-[0_0_15px_rgba(0,0,0,0.35)] z-20!' : 'bg-[#7a6a51] h-12 shadow-[inset_0_-2px_5px_rgba(0,0,0,0.35),0_0px_20px_rgba(0,0,0,0.55)]'}
              `}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
          
        {/* === CORPO DA PASTA === */}
        <div className="bg-[#837156] bg-[url(/assets/folder.jpg)] bg-blend-overlay bg-size-[30%] w-full h-8 relative z-10 rounded-t-md lg:rounded-t-none"></div>
        <div className="relative bg-[#837156] bg-[url(/assets/folder.jpg)] bg-blend-overlay bg-size-[30%] h-full p-2 sm:p-6 lg:p-6 shadow-2xl/90 rounded-b-lg">
          
          {isHome && (
            <>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(rgba(79,79,79,0.2),rgba(79,79,79,0.2)),url(/assets/paper.png)] bg-repeat bg-size-[30%] w-[97%] h-[95%] rotate-1 shadow-[0_0_40px_rgba(0,0,0,0.25)] p-1 z-11"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(rgba(109,109,109,0.2),rgba(109,109,109,0.2)),url(/assets/paper.png)] bg-repeat bg-size-[30%] w-[97%] h-[95%] rotate-[-0.5deg] shadow-[0_0_40px_rgba(0,0,0,0.25)] p-1 z-11"></div>
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