import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans">
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-red-600 font-bold tracking-tighter text-xl italic uppercase">
            Visão do Oculto
          </Link>
          
          <div className="flex gap-6 text-sm font-medium text-zinc-400">
            <Link to="/origins" className="hover:text-red-500 transition-colors">Origens</Link>
            <Link to="/tracks" className="hover:text-red-500 transition-colors">Trilhas</Link>
            <Link to="/powers" className="hover:text-red-500 transition-colors">Poderes</Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}