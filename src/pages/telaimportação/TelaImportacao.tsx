import Logo from "@/pages/home/components/logo";
import { useData, type Categoria } from "@/context/DataContext";
import { baixarTemplate } from "@/lib/templates";
import { Download, Upload, Package } from "lucide-react";
import { useRef, useState } from "react";
import FolderDiv from "@/components/ui/folder-div";
import { Button } from "@/components/ui/button";
import PaperDiv from "@/components/ui/paper-div";

const CATEGORIAS: { id: Categoria; label: string; descricao: string }[] = [
  { id: "poderes", label: "Poderes", descricao: "Poderes de classe, gerais, paranormais..." },
  { id: "rituais", label: "Rituais", descricao: "Rituais de todos os elementos e círculos." },
  { id: "equipamentos", label: "Equipamentos", descricao: "Armas, proteções, itens, modificações, maldições..." },
  { id: "origens", label: "Origens", descricao: "Origens e seus bônus." },
  { id: "trilhas", label: "Trilhas", descricao: "Trilhas para todas as classes." },
];

export default function TelaImportacao() {
  const { importarJson, status, entrarSemDados } = useData();
  const [resultados, setResultados] = useState<Record<string, { itens: number; erros: number } | null>>({});
  const [carregando, setCarregando] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleArquivo = async (categoria: Categoria | null, arquivo: File) => {
    const key = categoria || "pacote";
    setCarregando(key);
    try {
      const resultado = await importarJson(categoria, arquivo);
      setResultados(prev => ({ ...prev, [key]: resultado }));
    } catch (e) {
      console.error(e);
      setResultados(prev => ({ ...prev, [key]: null }));
    } finally {
      setCarregando(null);
    }
  };

  const temAlgumDado = Object.values(resultados).some(r => r && r.itens > 0);

  return (
    <div className="min-h-screen bg-[url(/assets/paper.png)] bg-repeat bg-size-[30%] flex flex-col items-center justify-center p-3 sm:p-6 py-8 sm:py-6 overflow-y-auto">

      <div className="w-full max-w-4xl">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl xs:text-4xl sm:text-6xl flex flex-wrap justify-center pointer-events-none select-none w-fit mx-auto mt-3 px-2">
            {'VISÃO DO OCULTO'.split("").map((char, index) => (
              <Logo key={index} char={char} />
            ))}
          </h1>
          <p className="font-special text-gray-600 text-xs sm:text-sm tracking-wide mt-4 max-w-2xl mx-auto px-2">
            O Visão do Oculto não disponibiliza nenhum conteúdo, apenas oferece acesso facilitado aos dados que você inserir. Importe os arquivos JSON de cada categoria, um pacote completo, ou entre no site e crie os itens diretamente para começar.
          </p>
        </div>

        <div className="relative">
          <FolderDiv className="relative z-10 p-3 sm:p-6 shadow-xl">
            <div className="mb-6 pb-4 border-b-2 border-dashed border-gray-400 flex flex-col items-center gap-2">
              <button
                onClick={entrarSemDados}
                className="w-full flex justify-center items-center cursor-pointer gap-2 px-4 py-3 text-sm font-special uppercase tracking-wide border-2 border-gray-800 bg-white text-gray-800 hover:bg-gray-900 hover:text-white transition-colors"
              >
                Entrar no site
              </button>
              {Object.values(resultados).some(r => r && r.itens > 0) && (
                <p className="text-xs text-gray-400 text-center">
                  Os dados são salvos no seu navegador — você não precisará importar novamente.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-4">

              <div className="border-2 border-gray-900 bg-gray-900 text-white p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <h3 className="font-special uppercase tracking-wide flex items-center gap-2 text-base sm:text-lg">
                      <Package className="size-5 shrink-0" /> JSON completo
                    </h3>
                    <p className="text-xs text-gray-300 mt-1">
                      Aceita múltiplas categorias em um arquivo.
                    </p>
                    {resultados["pacote"] && (
                      <p className="text-xs mt-2 font-bold text-green-400">
                        ✓ {resultados["pacote"].itens} itens restaurados no total
                        {resultados["pacote"].erros > 0 && <span className="text-amber-400 ml-2">({resultados["pacote"].erros} com erro)</span>}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 w-full sm:w-auto">
                    <input
                      ref={el => { inputRefs.current["pacote"] = el; }}
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={e => {
                        const arquivo = e.target.files?.[0];
                        if (arquivo) handleArquivo(null, arquivo);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      onClick={() => inputRefs.current["pacote"]?.click()}
                      disabled={carregando === "pacote"}
                      variant="secondary"
                      className="w-full sm:w-auto justify-center"
                    >
                      <Upload className="size-4" />
                      {carregando === "pacote" ? "Lendo..." : "Selecionar"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 my-2 opacity-50">
                <div className="h-px bg-gray-800 flex-1 border-b border-dashed border-gray-400"></div>
                <span className="font-special text-[10px] sm:text-xs uppercase text-gray-700 tracking-widest text-center shrink-0">OU INDIVIDUALMENTE</span>
                <div className="h-px bg-gray-800 flex-1 border-b border-dashed border-gray-400"></div>
              </div>

              {CATEGORIAS.map(cat => {
                const resultado = resultados[cat.id];
                const estaCarregando = carregando === cat.id;

                return (
                  <PaperDiv key={cat.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3! sm:p-4!">
                    <div className="min-w-0">
                      <p className="font-special uppercase tracking-wide text-gray-900 text-sm sm:text-base">{cat.label}</p>
                      <p className="text-xs text-gray-500">{cat.descricao}</p>
                      {resultado && (
                        <p className="text-xs mt-1 font-bold text-green-700">
                          ✓ {resultado.itens} itens carregados
                          {resultado.erros > 0 && <span className="text-amber-600 ml-2">({resultado.erros} com erro)</span>}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex w-full flex-wrap sm:w-auto gap-2">
                      <input
                        ref={el => { inputRefs.current[cat.id] = el; }}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={e => {
                          const arquivo = e.target.files?.[0];
                          if (arquivo) handleArquivo(cat.id, arquivo);
                          e.target.value = "";
                        }}
                      />
                      <Button
                        onClick={() => inputRefs.current[cat.id]?.click()}
                        disabled={estaCarregando}
                        className={`flex-1 sm:flex-initial justify-center ${resultado
                          ? "border-green-700 bg-green-100 text-green-800 hover:bg-green-200"
                          : ""
                          } disabled:opacity-50 disabled:cursor-wait`}
                      >
                        <Upload className="size-3.5" />
                        {estaCarregando ? "Lendo..." : resultado ? "Trocar" : "Selecionar"}
                      </Button>
                      <Button
                        onClick={() => baixarTemplate(cat.id)}
                        variant="outline"
                        className="flex-1 sm:flex-initial justify-center"
                      >
                        <Download className="size-3.5" /> Template
                      </Button>
                    </div>

                  </PaperDiv>

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
          </FolderDiv>
          <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[-0.5deg] p-1 bg-[linear-gradient(rgba(139,139,139,0.3),rgba(139,139,139,0.1)),url(/assets/paper.png)] shadow-[0_0_20px_rgba(0,0,0,0.2)] bg-repeat bg-size-[30%]" />
        </div>

        <p className="text-center text-xs text-gray-400 font-special mt-6 uppercase tracking-wider px-2">
          Este site não distribui material protegido por direitos autorais.<br />Todo o conteúdo é adicionado pelo usuário.
        </p>
      </div>
    </div>
  );
}