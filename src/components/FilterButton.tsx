export default function FilterButton({ label, isSelected, onClick }: { label: string | number; isSelected: boolean; onClick: () => void }) {
    return (
      <button
        onClick={onClick}
        className={`px-3 py-1 text-xs font-bold transition-colors border cursor-pointer ${
          isSelected
            ? 'bg-gray-800 text-white border-gray-800'
            : 'bg-gray-200/50 text-gray-700 border-gray-400 hover:bg-gray-300'
        }`}
      >
        {label}
      </button>
    );
  }