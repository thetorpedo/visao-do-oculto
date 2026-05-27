export const corElemento = (elemento: string | null) => {
    switch (elemento) {
        case "Sangue": return "text-white bg-[#aa2321] border-[#aa2321]";
        case "Morte": return "text-white bg-[#000000] border-[#000000]";
        case "Energia": return "text-white bg-[#9a03fa] border-[#9a03fa]";
        case "Conhecimento": return "text-white bg-[#ba921a] border-[#ba921a]";
        case "Medo": return "text-black bg-[#ffffff] border-gray-400";
        case "Intenção": return "text-white bg-orange-700/90 border-orange-700/90";
        case "Transmissão": return "text-white bg-green-700/90 border-green-700/90";
        default: return "text-gray-800 border-gray-400 bg-gray-200";
    }
};

export const estiloBadgeTipo = (tipo: string) => {
    switch (tipo) {
        // Classes & Origens
        case "Combatente": return "text-red-900 border-dashed border-red-300 bg-red-200/30";
        case "Especialista": return "text-blue-900 border-dashed border-blue-300 bg-blue-200/30";
        case "Ocultista": return "text-purple-900 border-dashed border-purple-300 bg-purple-200/30";
        case "Sobrevivente": return "text-orange-900 border-dashed border-orange-300 bg-orange-200/30";

        // Poderes
        case "Paranormal": return "text-gray-900 border-dashed border-gray-500 bg-gray-300/50";
        case "Sacrifício": return "text-rose-900 border-dashed border-rose-300 bg-rose-200/30";

        // Equipamentos
        case "Arma": return "text-red-900 border-dashed border-red-300 bg-red-200/30";
        case "Proteção": return "text-blue-900 border-dashed border-blue-300 bg-blue-200/30";
        case "Item Amaldiçoado": return "text-purple-900 border-dashed border-purple-300 bg-purple-200/30";
        case "Explosivo": return "text-orange-900 border-dashed border-orange-300 bg-orange-200/30";
        case "Maldição": return "text-fuchsia-900 border-dashed border-fuchsia-400 bg-fuchsia-200/30";
        case "Modificação": return "text-slate-900 border-dashed border-slate-400 bg-slate-200/30";

        // Padrão
        default: return "text-gray-800 border-dashed border-gray-400 bg-gray-300/30";
    }
};