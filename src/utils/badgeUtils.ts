export const corElemento = (elemento: string | null) => {
    switch (elemento) {
        case "Sangue": return "text-white bg-[#aa2321] border-[#aa2321]";
        case "Morte": return "text-white bg-[#000000] border-[#000000] dark:border-zinc-600";
        case "Energia": return "text-white bg-[#9a03fa] border-[#9a03fa]";
        case "Conhecimento": return "text-white bg-[#ba921a] border-[#ba921a]";
        case "Medo": return "text-gray-950 bg-[#ffffff] border-gray-400";
        case "Intenção": return "text-white bg-orange-700/90 border-orange-700/90";
        case "Transmissão": return "text-white bg-green-700/90 border-green-700/90";
        default: return "text-gray-800 border-gray-400 bg-gray-200";
    }
};

export const estiloBadgeTipo = (tipo: string) => {
    switch (tipo) {
        // Classes & Origens
        case "Combatente": return "text-red-900 dark:text-red-200 border-dashed border-red-300 dark:border-red-500/60 bg-red-200/30 dark:bg-red-950/50";
        case "Especialista": return "text-blue-900 dark:text-blue-200 border-dashed border-blue-300 dark:border-blue-500/60 bg-blue-200/30 dark:bg-blue-950/50";
        case "Ocultista": return "text-purple-900 dark:text-purple-200 border-dashed border-purple-300 dark:border-purple-500/60 bg-purple-200/30 dark:bg-purple-950/50";
        case "Sobrevivente": return "text-orange-900 dark:text-orange-200 border-dashed border-orange-300 dark:border-orange-500/60 bg-orange-200/30 dark:bg-orange-950/50";

        // Poderes
        case "Paranormal": return "text-black dark:text-emerald-200 border-dashed border-black dark:border-emerald-400/70";
        case "Sacrifício": return "text-rose-900 dark:text-rose-200 border-dashed border-rose-300 dark:border-rose-500/60 bg-rose-200/30 dark:bg-rose-950/50";

        // Equipamentos
        case "Arma": return "text-red-900 dark:text-red-200 border-dashed border-red-300 dark:border-red-500/60 bg-red-200/30 dark:bg-red-950/50";
        case "Proteção": return "text-blue-900 dark:text-blue-200 border-dashed border-blue-300 dark:border-blue-500/60 bg-blue-200/30 dark:bg-blue-950/50";
        case "Item Amaldiçoado": return "text-purple-900 dark:text-purple-200 border-dashed border-purple-300 dark:border-purple-500/60 bg-purple-200/30 dark:bg-purple-950/50";
        case "Explosivo": return "text-orange-900 dark:text-orange-200 border-dashed border-orange-300 dark:border-orange-500/60 bg-orange-200/30 dark:bg-orange-950/50";
        case "Maldição": return "text-fuchsia-900 dark:text-fuchsia-200 border-dashed border-fuchsia-400 dark:border-fuchsia-500/60 bg-fuchsia-200/30 dark:bg-fuchsia-950/50";
        case "Modificação": return "text-slate-900 dark:text-slate-200 border-dashed border-slate-400 dark:border-slate-500/60 bg-slate-200/30 dark:bg-slate-900/50";

        // Padrão
        default: return "text-gray-800 dark:text-emerald-200 border-dashed border-gray-400 dark:border-emerald-500/40 bg-gray-300/30 dark:bg-emerald-950/40";
    }
};