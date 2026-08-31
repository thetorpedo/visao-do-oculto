import { useData } from "@/context/DataContext";
import { useMemo, useState } from "react";
import PaperDiv from "@/components/ui/paper-div";
import FonteCard from "@/pages/fontes/components/fonte-card";
import FonteLeitor from "@/pages/fontes/components/fonte-leitor";
import { useFonteMedia } from "@/hooks/UseFontMedia";

export default function Fontes() {
  const { fontes, getBlobUrlFonte } = useData();
  const [fonteAberta, setFonteAberta] = useState<string | null>(null);

  const listaFontes = useMemo(
    () =>
      Object.values(fontes).sort((a, b) => {
        if (a.tipo !== b.tipo) return a.tipo === "dados" ? -1 : 1;
        return a.id.localeCompare(b.id);
      }),
    [fontes]
  );

  const { mediaUrl, isLoading } = useFonteMedia(fonteAberta, fontes, getBlobUrlFonte);

  const fonteAtual = fonteAberta ? fontes[fonteAberta] : null;

  return (
    <div className="min-h-[85vh] flex flex-col h-full">
      {!fonteAberta ? (
        <div className="space-y-6 flex-1 pb-10">
          <PaperDiv>
            <h2 className="text-3xl sm:text-4xl font-special text-gray-900 leading-tight mb-2">Fontes</h2>
            <p className="text-gray-700 max-w-3xl">
              Navegue diretamente pelos arquivos de fonte.
              <br />
              Se estiver usando celular, talvez seu navegador não suporte a leitura de PDFs diretamente no site.
            </p>
          </PaperDiv>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listaFontes.map(fonte => (
              <FonteCard key={fonte.id} fonte={fonte} onClick={() => setFonteAberta(fonte.id)} />
            ))}
          </div>
        </div>
      ) : (
        <FonteLeitor
          fonte={fonteAtual}
          mediaUrl={mediaUrl}
          isLoading={isLoading}
          onVoltar={() => setFonteAberta(null)}
        />
      )}
    </div>
  );
}