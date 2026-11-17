import { useEffect, useState, type ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { BookText, Bookmark, Menu, Moon, Search, Settings, Shield, Sun, X, type LucideIcon } from "lucide-react";
import SigilRain from "@/pages/home/components/sigil-rain";
import PaperDiv from "@/components/ui/paper-div";
import GlitchTitle from "../home/components/glitch-title";
import { useUI } from "@/context/UiContext";

interface NavItem {
  to: string;
  label: string;
  z?: string;
  margin?: string;
}

interface SideMarkerItem {
  to: string;
  label: string;
  icon: LucideIcon;
  activeColor: string;
  inactiveColor: string;
}

interface DesktopTabProps extends NavItem {
  children?: ReactNode;
  className?: string;
}

const NAV_LINKS: NavItem[] = [
  { to: "/", label: "INÍCIO", z: "z-[10]", margin: "" },
  { to: "/origens", label: "ORIGENS", z: "z-[9]", margin: "-ml-5" },
  { to: "/poderes", label: "PODERES", z: "z-[8]", margin: "-ml-5" },
  { to: "/trilhas", label: "TRILHAS", z: "z-[7]", margin: "-ml-5" },
  { to: "/equipamentos", label: "EQUIPAM.", z: "z-[6]", margin: "-ml-5" },
  { to: "/rituais", label: "RITUAIS", z: "z-[5]", margin: "-ml-5" },
  { to: "/regras", label: "REGRAS", z: "z-[4]", margin: "-ml-5" },
  { to: "/ameacas", label: "AMEAÇAS", z: "z-[3]", margin: "-ml-5" },
];

const SIDE_MARKERS: SideMarkerItem[] = [
  {
    to: "/escudo",
    label: "Escudo do Mestre",
    icon: Shield,
    activeColor: "bg-emerald-400/75 text-gray-900",
    inactiveColor: "bg-emerald-400/45 text-gray-900/70 hover:bg-emerald-400/70 hover:text-gray-900",
  },
  {
    to: "/colecoes",
    label: "Coleções",
    icon: Bookmark,
    activeColor: "bg-rose-400/75 text-gray-900",
    inactiveColor: "bg-rose-400/45 text-gray-900/70 hover:bg-rose-400/70 hover:text-gray-900",
  },
  {
    to: "/fontes",
    label: "Fontes",
    icon: BookText,
    activeColor: "bg-sky-400/75 text-gray-900",
    inactiveColor: "bg-sky-400/45 text-gray-900/70 hover:bg-sky-400/70 hover:text-gray-900",
  },
  {
    to: "/configuracoes",
    label: "Configurações",
    icon: Settings,
    activeColor: "bg-amber-400/75 text-gray-900",
    inactiveColor: "bg-amber-400/45 text-gray-900/70 hover:bg-amber-400/70 hover:text-gray-900",
  },
];

const ALL_MOBILE_LINKS: NavItem[] = [
  ...NAV_LINKS,
  { to: "/fontes", label: "FONTES" },
  { to: "/colecoes", label: "COLEÇÕES" },
  { to: "/configuracoes", label: "Configurações" },
];

const MOBILE_SIDE_MARKERS: SideMarkerItem[] = SIDE_MARKERS.filter(
  (marker) => marker.to !== "/escudo"
);

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
        dark:m-0! dark:h-11! dark:items-center! dark:pt-0! dark:rounded-none! dark:bg-none dark:border
        ${z} ${margin} ${className}
        ${isActive
          ? "-mt-10 z-20! h-14 bg-[#837156] shadow-[0_0_20px_rgba(0,0,0,0.75)] dark:bg-[#222925]! dark:border-emerald-500/60 dark:text-emerald-300 dark:shadow-none"
          : "h-12 bg-[#7a6a51] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.35),0_0_20px_rgba(0,0,0,0.75)] dark:bg-[#121514] dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-[#1a1e1c] dark:hover:border-zinc-600 dark:hover:text-zinc-200 dark:shadow-none"
        }
      `}
    >
      {children ?? <span className="-mt-1.5 dark:mt-0 truncate px-1">{label}</span>}
    </NavLink>
  );
}

function SideMarker({ to, label, icon: Icon, activeColor, inactiveColor }: SideMarkerItem) {
  return (
    <NavLink
      to={to}
      title={label}
      aria-label={label}
      className={({ isActive }) => `
        flex cursor-pointer items-center justify-start
        bg-[url(/assets/paper.png)] bg-blend-overlay bg-size-[300%]
        pl-2.5 pr-3 py-2.5 rounded-l-xs transition-all
        dark:w-10! dark:h-10 dark:p-0! dark:justify-center dark:rounded-none! dark:bg-none! dark:border
        ${isActive
          ? `w-13 ${activeColor} shadow-[inset_-8px_0_5px_rgba(0,0,0,0.22),-4px_4px_10px_rgba(0,0,0,0.45)] dark:bg-[#222925]! dark:border-emerald-500/60 dark:text-emerald-300! dark:shadow-none!`
          : `w-10 hover:w-12 ${inactiveColor} shadow-[inset_-8px_0_5px_rgba(0,0,0,0.15),-2px_3px_6px_rgba(0,0,0,0.35)] dark:bg-[#121514]! dark:border-zinc-800 dark:text-zinc-400! dark:hover:bg-[#1a1e1c]! dark:hover:border-zinc-600 dark:hover:text-zinc-200! dark:shadow-none!`
        }
      `}
    >
      <Icon className="size-5 shrink-0" />
    </NavLink>
  );
}

export default function FolderLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { tema, toggleTema } = useUI();
  const isEstrangeiro = tema === "estrangeiro";

  const bottomRowLinks = NAV_LINKS.slice(0, 5);
  const topRowLinks = NAV_LINKS.slice(5);

  const abaAtualLabel =
    ALL_MOBILE_LINKS.find((item) => item.to === pathname)?.label ?? "INÍCIO";

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-start lg:justify-center overflow-x-hidden bg-[#453b13] dark:bg-[#040c07] bg-[radial-gradient(#5b4f21_1px,transparent_1px)] dark:bg-[radial-gradient(#123520_1px,transparent_1px)] overflow-hidden bg-size-[16px_16px] lg:bg-black lg:dark:bg-[#020804]">
      <SigilRain />

      {/* Navbar Mobile */}
      <header className="fixed top-0 left-0 z-50 flex h-14 w-full items-center justify-between border-b border-black/40 dark:border-zinc-800 bg-[#6e5e46] dark:bg-[#121514] bg-[url(/assets/folder.jpg)] dark:bg-none bg-size-[40%] bg-blend-overlay px-3 shadow-[0_4px_16px_rgba(0,0,0,0.45)] lg:hidden">
        <NavLink
          to="/"
          className="flex min-w-0 items-center gap-2"
        >
          <PaperDiv className="p-0! flex flex-row items-center">
            <span className="truncate bg-[linear-gradient(rgba(249,249,249,0.75),rgba(249,249,249,0.75)),url(/assets/paper.png)] dark:bg-[#1c201e] dark:bg-none bg-size-[200%] px-2.5 py-1 font-special text-sm tracking-wider text-gray-900 dark:text-zinc-100 uppercase mx-auto ">
              <GlitchTitle text="VISÃO DO OCULTO" inline />
            </span>

            {!isHome && (
              <span className="truncate px-2 -mb-0.5 font-daisy text-xs tracking-wider text-black/80 dark:text-emerald-400 uppercase">
                {abaAtualLabel}
              </span>
            )}
          </PaperDiv>
        </NavLink>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleTema}
            className="flex size-9 cursor-pointer items-center justify-center bg-white/50 text-black shadow-xs active:translate-y-0.5"
            title={isEstrangeiro ? "Tema Claro" : "Tema Estrangeiro (Dark)"}
            aria-label="Alternar tema"
          >
            {isEstrangeiro ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-global-search"))}
            className="flex h-9 cursor-pointer items-center gap-1.5 bg-[linear-gradient(rgba(249,249,249,0.8),rgba(249,249,249,0.8)),url(/assets/paper.png)] dark:bg-[#1c201e] dark:bg-none dark:border dark:border-zinc-700 bg-size-[200%] px-2.5 text-gray-900 dark:text-zinc-200 shadow-xs active:translate-y-0.5"
            aria-label="Abrir pesquisa"
          >
            <Search className="size-4 shrink-0 text-gray-800 dark:text-emerald-400" />
            <span className="hidden xs:inline font-special text-xs uppercase tracking-wide text-gray-700 dark:text-zinc-200">
              Buscar
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex size-9 cursor-pointer items-center justify-center bg-black dark:bg-zinc-800 dark:border dark:border-zinc-700 text-white dark:text-emerald-400 shadow-xs active:translate-y-0.5"
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {/* Menu Mobile estilo Dossiê */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-60 flex items-start justify-center bg-black/70 backdrop-blur-xs p-3 pt-16 animate-in fade-in duration-150 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <nav
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-md border border-black/50 dark:border-zinc-700 bg-[#837156] dark:bg-[#141716] bg-[url(/assets/folder.jpg)] dark:bg-none bg-size-[35%] bg-blend-overlay p-3 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="relative border border-gray-300 dark:border-zinc-700 bg-[linear-gradient(rgba(249,249,249,0.6),rgba(249,249,249,0.6)),url(/assets/paper.png)] dark:bg-[#1c201e] dark:bg-none bg-repeat bg-size-[30%] p-4 shadow-md">
              <div className="mb-3 flex items-center justify-between border-b-2 border-dashed border-gray-400 pb-2">
                <span className="font-special text-sm tracking-widest text-gray-800 uppercase">
                  Arquivos & Seções
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex size-7 cursor-pointer items-center justify-center text-gray-700 hover:text-red-700"
                  aria-label="Fechar menu"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {NAV_LINKS.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `
                      flex items-center justify-center border px-3 py-2.5 text-center font-special text-sm tracking-wider uppercase transition-all
                      ${isActive
                        ? "border-gray-900 bg-gray-900 text-white shadow-xs"
                        : "border-dashed border-gray-400 bg-white/60 text-gray-800 hover:bg-white"
                      }
                    `}
                  >
                    {label}
                  </NavLink>
                ))}
              </div>

              <div className="mt-4 border-t-2 border-dashed border-gray-400 pt-3">
                <div className="grid grid-cols-3 gap-2">
                  {MOBILE_SIDE_MARKERS.map(({ to, label, icon: Icon, activeColor, inactiveColor }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => `
                        flex flex-col items-center justify-center gap-1 border border-black/20 px-2 py-2 text-center font-special text-[11px] uppercase transition-all
                        bg-[url(/assets/paper.png)] bg-blend-overlay bg-size-[300%]
                        ${isActive
                          ? `${activeColor} ring-2 ring-gray-900 font-bold shadow-xs`
                          : `${inactiveColor} shadow-2xs`
                        }
                      `}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate w-full">{label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}

      <main className="relative z-10 mx-auto mt-16 -mb-1 w-[96%] pb-6 sm:w-[92%] md:w-[88%] lg:mt-20 lg:w-4/5 lg:pb-8">
        {/* Abas desktop */}
        <div className="hidden flex-row flex-wrap-reverse justify-between lg:flex dark:mb-2">
          <div className="flex flex-col gap-11 dark:gap-2">
            <div className="-mb-4 flex flex-row pl-5 z-0 dark:mb-0 dark:pl-0 dark:gap-2">
              {topRowLinks.map((link) => (
                <DesktopTab key={link.to} {...link} />
              ))}
            </div>
            <div className="flex flex-row z-10 dark:gap-2">
              {bottomRowLinks.map((link) => (
                <DesktopTab key={link.to} {...link} />
              ))}
            </div>
          </div>
        </div>

        <div className="relative hidden h-8 w-full rounded-t-md z-10 bg-[#837156] bg-[url(/assets/folder.jpg)] bg-size-[30%] bg-blend-overlay lg:block lg:rounded-tl-none dark:hidden!" />

        <div className="relative h-full rounded-md lg:rounded-t-none lg:rounded-b-lg dark:rounded-none! bg-[#837156] dark:bg-[#141716] bg-[url(/assets/folder.jpg)] dark:bg-none bg-size-[30%] bg-blend-overlay dark:border dark:border-zinc-800 p-2 sm:p-4 lg:p-6 shadow-2xl/90">
          {/* Marcadores laterais (Coleções, Fontes, Configurações, Tema) */}
          <div className="hidden lg:flex flex-col items-end gap-2.5 dark:gap-2 absolute top-6 dark:top-0 right-full dark:right-[calc(100%+10px)] z-0">
            {SIDE_MARKERS.map((marker) => (
              <SideMarker key={marker.to} {...marker} />
            ))}
            <button
              type="button"
              onClick={toggleTema}
              title={isEstrangeiro ? "Modo Claro" : "Modo Escuro"}
              aria-label="Alternar tema"
              className={`
                flex cursor-pointer items-center justify-start
                bg-[url(/assets/paper.png)] bg-blend-overlay bg-size-[300%]
                pl-2.5 pr-3 py-2.5 rounded-l-xs transition-all
                dark:w-10! dark:h-10 dark:p-0! dark:justify-center dark:rounded-none! dark:bg-none! dark:border
                ${isEstrangeiro
                  ? "w-13 bg-emerald-400/80 text-gray-950 shadow-[inset_-8px_0_5px_rgba(0,0,0,0.22),-4px_4px_10px_rgba(0,0,0,0.45)] dark:bg-[#121514]! dark:border-zinc-800 dark:text-emerald-400! dark:hover:bg-[#1a1e1c]! dark:hover:border-zinc-600 dark:shadow-none!"
                  : "w-10 hover:w-12 bg-emerald-400/45 text-gray-900/70 hover:bg-emerald-400/70 hover:text-gray-900 shadow-[inset_-8px_0_5px_rgba(0,0,0,0.15),-2px_3px_6px_rgba(0,0,0,0.35)]"
                }
              `}
            >
              {isEstrangeiro ? <Sun className="size-5 shrink-0" /> : <Moon className="size-5 shrink-0" />}
            </button>
          </div>

          {isHome && (
            <>
              <div className="pointer-events-none absolute top-1/2 left-1/2 z-11 h-[95%] w-[97%] -translate-x-1/2 -translate-y-1/2 rotate-1 bg-[linear-gradient(rgba(79,79,79,0.2),rgba(79,79,79,0.2)),url(/assets/paper.png)] bg-repeat bg-size-[30%] p-1 shadow-[0_0_40px_rgba(0,0,0,0.25)] dark:hidden" />
              <div className="pointer-events-none absolute top-1/2 left-1/2 z-11 h-[95%] w-[97%] -translate-x-1/2 -translate-y-1/2 rotate-[-0.5deg] bg-[linear-gradient(rgba(109,109,109,0.2),rgba(109,109,109,0.2)),url(/assets/paper.png)] bg-repeat bg-size-[30%] p-1 shadow-[0_0_40px_rgba(0,0,0,0.25)] dark:hidden" />
            </>
          )}

          <div
            className={`relative z-12 h-full w-full bg-repeat bg-size-[30%] ${isHome
              ? "bg-[linear-gradient(rgba(229,229,229,0.5),rgba(229,229,229,0.5)),url(/assets/paper.png)] dark:bg-[#1c201e] dark:bg-none dark:border dark:border-zinc-700/80 shadow-[0_0_15px_rgba(0,0,0,0.15)]"
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