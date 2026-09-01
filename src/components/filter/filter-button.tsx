import type { EstadoFiltro } from "@/hooks/useFiltros";

interface FilterButtonProps {
  label: string;
  estado?: EstadoFiltro;
  isSelected?: boolean;
  onClick: () => void;
}

export default function FilterButton({ label, estado, isSelected, onClick }: FilterButtonProps) {
  const estadoEfetivo: EstadoFiltro = estado ?? (isSelected ? "incluir" : "neutro");

  const estilos: Record<EstadoFiltro, string> = {
    neutro: "border-gray-400/50 bg-white/60 text-gray-700 hover:bg-gray-100 hover:border-gray-600",
    incluir: "border-gray-900 bg-gray-900 text-white hover:bg-gray-700",
    excluir: "border-red-700 bg-red-700 text-white hover:bg-red-800 line-through",
  };

  const titulo: Record<EstadoFiltro, string> = {
    neutro: `Clique para incluir "${label}"`,
    incluir: `Clique para excluir "${label}"`,
    excluir: `Clique para remover filtro "${label}"`,
  };

  return (
    <button
      onClick={onClick}
      title={titulo[estadoEfetivo]}
      className={`
        px-2.5 py-0 text-sm uppercase tracking-tight font-daisy
        border cursor-pointer select-none truncate
        ${estilos[estadoEfetivo]}
      `}
    >
      {label}
    </button>
  );
}