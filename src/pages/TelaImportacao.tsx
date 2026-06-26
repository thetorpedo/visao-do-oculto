import Logo from "@/components/logo";
import { useData, type Categoria } from "@/context/DataContext";
import { FileJson, Upload } from "lucide-react";
import { useRef, useState } from "react";

const CATEGORIAS: { id: Categoria; label: string; descricao: string }[] = [
  { id: "poderes", label: "Poderes", descricao: "Poderes de classe, gerais, paranormais..." },
  { id: "rituais", label: "Rituais", descricao: "Rituais de todos os elementos e círculos." },
  { id: "equipamentos", label: "Equipamentos", descricao: "Armas, proteções, itens, modificações e maldições." },
  { id: "origens", label: "Origens", descricao: "Origens e seus bônus." },
  { id: "trilhas", label: "Trilhas", descricao: "Trilhas para todas as classes." },
];

export default function TelaImportacao() {
  const { importarJson, status } = useData();
  const [resultados, setResultados] = useState<Record<string, { itens: number; erros: number } | null>>({});
  const [carregando, setCarregando] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleArquivo = async (categoria: Categoria, arquivo: File) => {
    setCarregando(categoria);
    try {
      const resultado = await importarJson(categoria, arquivo);
      setResultados(prev => ({ ...prev, [categoria]: resultado }));
    } catch (e) {
      console.error(e);
      setResultados(prev => ({ ...prev, [categoria]: null }));
    } finally {
      setCarregando(null);
    }
  };

  const temAlgumDado = Object.values(resultados).some(r => r && r.itens > 0);

  return (
    <div className="min-h-screen bg-[url(/assets/paper.png)] bg-repeat bg-size-[30%] flex flex-col items-center justify-center p-6">

      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-6xl flex flex-wrap mb-3 justify-center pointer-events-none select-none border-b-4 border-dashed border-gray-800 w-fit mx-auto pb-2">
            {'VISÃO DO OCULTO'.split("").map((char, index) => (
              <Logo key={index} char={char} />
            ))}
          </h1>
          <p className="font-special text-gray-600 text-sm tracking-wide mt-4">
            O Visão do Oculto não disponibiliza nenhum conteúdo, <br />apenas oferece acesso facilitado aos dados que você inserir.
          </p>
        </div>

        {/* Card principal */}
        <div className="relative">
          <div className="relative z-10 bg-[linear-gradient(rgba(249,249,249,0.8),rgba(249,249,249,0.8)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border-2 border-gray-800 p-6 shadow-xl">

            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-dashed border-gray-400">
              <FileJson className="size-6 text-gray-700" />
              <div>
                <h2 className="font-special text-xl text-gray-900 uppercase tracking-wide">Importar Dados</h2>
                <p className="text-sm text-gray-600">Selecione os arquivos JSON para cada categoria.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {CATEGORIAS.map(cat => {
                const resultado = resultados[cat.id];
                const estaCarregando = carregando === cat.id;

                return (
                  <div key={cat.id} className="flex items-center justify-between gap-4 border border-dashed border-gray-400 bg-white/40 p-3">
                    <div className="min-w-0">
                      <p className="font-special uppercase tracking-wide text-gray-900">{cat.label}</p>
                      <p className="text-xs text-gray-500">{cat.descricao}</p>
                      {resultado && (
                        <p className="text-xs mt-1 font-bold text-green-700">
                          ✓ {resultado.itens} itens carregados
                          {resultado.erros > 0 && <span className="text-amber-600 ml-2">({resultado.erros} com erro)</span>}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      <input
                        ref={el => { inputRefs.current[cat.id] = el; }}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={e => {
                          const arquivo = e.target.files?.[0];
                          if (arquivo) handleArquivo(cat.id, arquivo);
                        }}
                      />
                      <button
                        onClick={() => inputRefs.current[cat.id]?.click()}
                        disabled={estaCarregando}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-special uppercase tracking-wide border-2 transition-colors ${resultado
                          ? "border-green-700 bg-green-100 text-green-800 hover:bg-green-200"
                          : "border-gray-800 bg-gray-800 text-white hover:bg-gray-700"
                          } disabled:opacity-50 disabled:cursor-wait`}
                      >
                        <Upload className="size-3.5" />
                        {estaCarregando ? "Carregando..." : resultado ? "Trocar" : "Selecionar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {temAlgumDado && status !== "ready" && (
              <p className="text-center text-sm text-gray-500 font-special mt-4 animate-pulse">
                Carregando o site...
              </p>
            )}

            {temAlgumDado && (
              <p className="text-center text-xs text-gray-400 mt-4">
                Os dados são salvos no seu navegador — você não precisará importar novamente.
              </p>
            )}
          </div>
          <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[-0.5deg] p-1 bg-[linear-gradient(rgba(139,139,139,0.3),rgba(139,139,139,0.1)),url(/assets/paper.png)] shadow-[0_0_20px_rgba(0,0,0,0.2)] bg-repeat bg-size-[30%]" />
        </div>

        <p className="text-center text-xs text-gray-400 font-special mt-6 uppercase tracking-wider">
          Este site não distribui material protegido por direitos autorais.<br />Todo o conteúdo é importado pelo usuário.
        </p>
      </div>
    </div>
  );
}