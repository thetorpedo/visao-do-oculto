import { useEffect, useState, type ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, Search, Settings, X } from "lucide-react";
import GlitchTitle from "@/pages/home/components/glitch-title";
import PaperStamp from "@/components/ui/paper-stamp";
import SigilRain from "@/pages/home/components/sigil-rain";

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
  className = "w-32 xl:w-50",
}: DesktopTabProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        -mt-8 flex cursor-pointer items-start justify-center rounded-t-lg bg-[url(/assets/folder.jpg)]
        bg-size-[240%] bg-blend-overlay pt-4 font-special text-lg text-black/70 transition-all
        hover:-mt-12 hover:h-16 xl:text-2xl
        ${z} ${margin} ${className}
        ${isActive
          ? "-mt-10  z-20! h-14 bg-[#837156] shadow-[0_0_20px_rgba(0,0,0,0.75)]"
          : "h-12 bg-[#7a6a51] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.35),0_0_20px_rgba(0,0,0,0.75)]"
        }
      `}
    >
      {children ?? <span className="-mt-1.5 truncate px-1">{label}</span>}
    </NavLink>
  );
}

export default function FolderLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const bottomRowLinks = NAV_LINKS.slice(0, 5);
  const topRowLinks = NAV_LINKS.slice(5, 9);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#453b13] bg-[radial-gradient(#5b4f21_1px,transparent_1px)] bg-size-[16px_16px] lg:bg-black">
      <SigilRain />

      <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between bg-[#837156] bg-[url(/assets/folder.jpg)] bg-size-[30%] bg-blend-overlay p-3 shadow-xl backdrop-blur-md sm:p-4 lg:hidden">
        <span className="relative min-w-0">
          <span className="relative z-99 block truncate bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] p-2 font-special text-base tracking-widest text-black uppercase sm:text-xl">
            <GlitchTitle text="VISÃO DO OCULTO" inline />
          </span>
          <PaperStamp />
        </span>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-global-search"))}
            className="relative flex size-11 cursor-pointer items-center justify-center text-black"
            aria-label="Abrir pesquisa"
          >
            <Search className="relative z-99 size-7 bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] sm:size-8" />
            <PaperStamp />
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="relative flex size-11 cursor-pointer items-center justify-center text-black"
            aria-label="Abrir menu"
          >
            <Menu className="relative z-99 size-7 bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] sm:size-8" />
            <PaperStamp />
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <nav className="fixed inset-0 z-60 flex animate-in flex-col items-center justify-center overflow-y-auto bg-[#160a03]/95 fade-in py-16 backdrop-blur-lg duration-200 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-6 right-6 cursor-pointer p-2 text-[#fde047] transition-transform hover:rotate-90"
            aria-label="Fechar menu"
          >
            <X className="size-9 sm:size-10" />
          </button>
          <div className="flex w-full max-w-100 flex-col gap-2 px-6 text-center sm:gap-3">
            {ALL_MOBILE_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `
                  border-b-2 border-dashed border-[#5b4f21] py-2 font-special text-xl tracking-wider uppercase
                  transition-colors sm:text-2xl
                  ${isActive ? "bg-[#5b4f21]/20 text-white" : "text-[#fde047]/70 hover:text-[#fde047]"}
                `}
              >
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}

      <main className="relative z-10 mx-auto mt-20 -mb-1 w-[92%] pb-8 sm:w-[90%] md:w-[88%] lg:mt-20 lg:w-4/5">
        {/* Abas desktop */}
        <div className="hidden flex-row flex-wrap-reverse justify-between lg:flex">
          <div className="flex flex-col gap-11">
            <div className="-mb-4 flex flex-row pl-5 z-0">
              {topRowLinks.map((link) => (
                <DesktopTab key={link.to} {...link} />
              ))}
            </div>
            <div className="flex flex-row z-10">
              {bottomRowLinks.map((link) => (
                <DesktopTab key={link.to} {...link} />
              ))}
            </div>
          </div>

          <DesktopTab to="/configuracoes" label="Configurações" className="w-fit px-4">
            <Settings className="-mt-0.5" />
          </DesktopTab>
        </div>

        <div className="relative h-8 w-full rounded-t-md z-10 bg-[#837156] bg-[url(/assets/folder.jpg)] bg-size-[30%] bg-blend-overlay lg:rounded-t-none" />

        <div className="relative h-full rounded-b-lg  bg-[#837156] bg-[url(/assets/folder.jpg)] bg-size-[30%] bg-blend-overlay p-2 shadow-2xl/90 sm:p-4 lg:p-6">
          {isHome && (
            <>
              <div className="pointer-events-none absolute top-1/2 left-1/2 z-11 h-[95%] w-[97%] -translate-x-1/2 -translate-y-1/2 rotate-1 bg-[linear-gradient(rgba(79,79,79,0.2),rgba(79,79,79,0.2)),url(/assets/paper.png)] bg-repeat bg-size-[30%] p-1 shadow-[0_0_40px_rgba(0,0,0,0.25)]" />
              <div className="pointer-events-none absolute top-1/2 left-1/2 z-11 h-[95%] w-[97%] -translate-x-1/2 -translate-y-1/2 rotate-[-0.5deg] bg-[linear-gradient(rgba(109,109,109,0.2),rgba(109,109,109,0.2)),url(/assets/paper.png)] bg-repeat bg-size-[30%] p-1 shadow-[0_0_40px_rgba(0,0,0,0.25)]" />
            </>
          )}

          <div
            className={`relative z-12 h-full w-full bg-repeat bg-size-[30%] ${isHome
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