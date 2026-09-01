import { FonteConfig } from "@/context/DataContext";
import { useEffect, useState } from "react";

const CACHE_NAME = "visao-oculto-pdfs";

/**
 * Resolve a URL de mídia (blob, cache offline, ou estática) de uma fonte,
 * e cuida do ciclo de vida do object URL criado.
 */
export function useFonteMedia(
    fonteId: string | null,
    fontes: Record<string, FonteConfig>,
    getBlobUrlFonte: (id: string) => Promise<string | null>
) {
    const [mediaUrl, setMediaUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!fonteId) {
            setMediaUrl("");
            return;
        }

        let urlCriadaNaMemoria: string | null = null;
        let cancelado = false;
        setIsLoading(true);

        const resolverUrlEstaticaOuCache = async (fonte: FonteConfig | undefined) => {
            const nomeArquivo = fonte?.nomeArquivo ?? `${fonteId}.pdf`;
            const urlEstatica = `/files/${nomeArquivo}`;

            try {
                if ("caches" in window) {
                    const cache = await caches.open(CACHE_NAME);
                    const cached = await cache.match(urlEstatica);
                    if (cached) {
                        const blob = await cached.blob();
                        return URL.createObjectURL(blob);
                    }
                }
            } catch (e) {
                console.warn("Falha ao ler cache offline", e);
            }

            return urlEstatica;
        };

        const carregarFonte = async () => {
            const blobUrl = await getBlobUrlFonte(fonteId);
            let url: string;

            if (blobUrl) {
                url = blobUrl;
                urlCriadaNaMemoria = blobUrl;
            } else {
                url = await resolverUrlEstaticaOuCache(fontes[fonteId]);
                if (url.startsWith("blob:")) urlCriadaNaMemoria = url;
            }

            if (!cancelado) {
                setMediaUrl(url);
                setIsLoading(false);
            }
        };

        carregarFonte();

        return () => {
            cancelado = true;
            if (urlCriadaNaMemoria) URL.revokeObjectURL(urlCriadaNaMemoria);
        };
    }, [fonteId, getBlobUrlFonte, fontes]);

    return { mediaUrl, isLoading };
}