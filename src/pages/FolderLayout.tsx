import { useEffect, useState, type ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, Search, Settings, X } from "lucide-react";
import Logo from "@/components/home/logo";
import PaperStamp from "@/components/ui/paper-stamp";
import SigilRain from "@/components/home/sigil-rain";

interface NavItem {
  to: string;
  label: string;
  z?: string;
  margin?: string;
}

interface DesktopTabProps extends NavItem {
  children?: ReactNode;
  className?: string;
}

const NAV_LINKS: NavItem[] = [
  { to: "/", label: "INÍCIO", z: "z-[9]", margin: "" },
  { to: "/origens", label: "ORIGENS", z: "z-[8]", margin: "-ml-5" },
  { to: "/poderes", label: "PODERES", z: "z-[7]", margin: "-ml-5" },
  { to: "/trilhas", label: "TRILHAS", z: "z-[6]", margin: "-ml-5" },
  { to: "/equipamentos", label: "EQUIPAM.", z: "z-[5]", margin: "-ml-5" },
  { to: "/rituais", label: "RITUAIS", z: "z-[4]", margin: "-ml-5" },
  { to: "/regras", label: "REGRAS", z: "z-[3]", margin: "-ml-5" },
  { to: "/fontes", label: "FONTES", z: "z-[2]", margin: "-ml-5" },
  { to: "/colecoes", label: "COLEÇÕES", z: "z-[1]", margin: "-ml-5" },
];

const ALL_MOBILE_LINKS: NavItem[] = [
  ...NAV_LINKS,
  { to: "/configuracoes", label: "Configurações" },
];

function DesktopTab({
  to,
  label,
  z = "",
  margin = "",
  children,
  className = "w-40 xl:w-50",
}: DesktopTabProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        font-special bg-[url(/assets/folder.jpg)] bg-blend-overlay bg-size-[240%] -mt-8 rounded-t-lg flex justify-center items-start text-black/70 text-2xl pt-4 transition-all hover:-mt-12 hover:h-16 cursor-pointer
        ${z} ${margin} ${className}
        ${isActive ? "bg-[#837156] h-14 -mt-10 z-20! shadow-[0_0_20px_rgba(0,0,0,0.75)]" : "bg-[#7a6a51] h-12 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.35),0_0_20px_rgba(0,0,0,0.75)]"}
      `}
    >
      {children ?? <span className="-mt-1">{label}</span>}
    </NavLink>
  );
}

export default function FolderLayout() {
  const { pathname } = useLocation();
  const is_home = pathname === "/";
  const [is_mobile_menu_open, setIsMobileMenuOpen] = useState(false);

  const bottom_row_links = NAV_LINKS.slice(0, 5);
  const top_row_links = NAV_LINKS.slice(5, 9);

  useEffect(() => {
    document.body.style.overflow = is_mobile_menu_open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [is_mobile_menu_open]);

  return (
    <div className="relative overflow-hidden bg-[#453b13] lg:bg-black bg-[radial-gradient(#5b4f21_1px,transparent_1px)] bg-size-[16px_16px] min-h-screen flex flex-col justify-center items-center">
      <SigilRain />

      <header className="lg:hidden fixed top-0 left-0 w-full bg-[#837156] bg-[url(/assets/folder.jpg)] bg-blend-overlay bg-size-[30%] backdrop-blur-md z-50 flex justify-between items-center p-4 shadow-xl">
        <span className="relative">
          <span className="relative z-99 font-special text-xl text-black tracking-widest p-2 bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] uppercase">
            {"VISÃO DO OCULTO".split("").map((char, index) => (
              <Logo key={index} char={char} />
            ))}
          </span>
          <PaperStamp />
        </span>

        <div className="space-x-4 flex items-center">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-global-search"))}
            className="text-black p-1 relative cursor-pointer"
            aria-label="Abrir pesquisa"
          >
            <Search className="relative size-8 z-99 bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)]" />
            <PaperStamp />
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-black p-1 relative cursor-pointer"
            aria-label="Abrir menu"
          >
            <Menu className="relative size-8 z-99 bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)]" />
            <PaperStamp />
          </button>
        </div>
      </header>

      {is_mobile_menu_open && (
        <nav className="lg:hidden fixed inset-0 z-60 bg-[#160a03]/95 backdrop-blur-lg flex flex-col items-center justify-center animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-6 right-6 text-[#fde047] p-2 hover:rotate-90 transition-transform cursor-pointer"
            aria-label="Fechar menu"
          >
            <X className="size-10" />
          </button>
          <div className="flex flex-col gap-3 max-w-100 text-center w-full px-6">
            {ALL_MOBILE_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `
                  font-special text-2xl uppercase tracking-wider py-2 border-b-2 border-dashed border-[#5b4f21] transition-colors
                  ${isActive ? "text-white bg-[#5b4f21]/20" : "text-[#fde047]/70 hover:text-[#fde047]"}
                `}
              >
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}

      <main className="w-[95%] lg:w-4/5 -mb-1 mx-auto mt-24 lg:mt-20 relative z-10 pb-8">
        <div className="hidden lg:flex flex-row justify-between relative z-0 flex-wrap-reverse">
          <div className="flex flex-col relative z-0 gap-11">
            <div className="flex flex-row relative z-0 pl-5 -mb-4">
              {top_row_links.map((link) => (
                <DesktopTab key={link.to} {...link} />
              ))}
            </div>
            <div className="flex flex-row relative z-10">
              {bottom_row_links.map((link) => (
                <DesktopTab key={link.to} {...link} />
              ))}
            </div>
          </div>

          <DesktopTab to="/configuracoes" label="Configurações" className="w-fit px-4">
            <Settings className="-mt-0.5" />
          </DesktopTab>
        </div>

        <div className="bg-[#837156] bg-[url(/assets/folder.jpg)] bg-blend-overlay bg-size-[30%] w-full h-8 relative z-10 rounded-t-md lg:rounded-t-none" />
        <div className="relative bg-[#837156] bg-[url(/assets/folder.jpg)] bg-blend-overlay bg-size-[30%] h-full p-2 sm:p-6 lg:p-6 shadow-2xl/90 rounded-b-lg">
          {is_home && (
            <>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(rgba(79,79,79,0.2),rgba(79,79,79,0.2)),url(/assets/paper.png)] bg-repeat bg-size-[30%] w-[97%] h-[95%] rotate-1 shadow-[0_0_40px_rgba(0,0,0,0.25)] p-1 z-11 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(rgba(109,109,109,0.2),rgba(109,109,109,0.2)),url(/assets/paper.png)] bg-repeat bg-size-[30%] w-[97%] h-[95%] -rotate-[0.5deg] shadow-[0_0_40px_rgba(0,0,0,0.25)] p-1 z-11 pointer-events-none" />
            </>
          )}

          <div
            className={`relative w-full h-full z-12 bg-repeat bg-size-[30%] ${is_home
              ? "bg-[linear-gradient(rgba(229,229,229,0.5),rgba(229,229,229,0.5)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)]"
              : "bg-none shadow-none"
              }`}
          >
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}