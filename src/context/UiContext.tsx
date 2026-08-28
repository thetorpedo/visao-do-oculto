import { createContext, useCallback, useContext, useState } from "react";
import type { Categoria } from "@/context/DataContext";

interface LeitorState {
    fonteId: string;
    pagina: number;
    isOpen: boolean;
}

interface ModalState {
    categoria: Categoria | null;
    itemInicial: any | null;
    isOpen: boolean;
}

interface UIContextValue {
    leitor: LeitorState;
    abrirLeitor: (fonteId: string, pagina: number) => void;
    fecharLeitor: () => void;

    modal: ModalState;
    abrirCriar: (categoria: Categoria) => void;
    abrirEditar: (categoria: Categoria, item: any) => void;
    fecharModal: () => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
    const [leitor, setLeitor] = useState<LeitorState>({
        fonteId: "",
        pagina: 0,
        isOpen: false,
    });

    const [modal, setModal] = useState<ModalState>({
        categoria: null,
        itemInicial: null,
        isOpen: false,
    });

    const abrirLeitor = useCallback((fonteId: string, pagina: number) => {
        setLeitor({ fonteId, pagina, isOpen: true });
    }, []);

    const fecharLeitor = useCallback(() => {
        setLeitor((prev) => ({ ...prev, isOpen: false }));
    }, []);

    const abrirCriar = useCallback((categoria: Categoria) => {
        setModal({ categoria, itemInicial: null, isOpen: true });
    }, []);

    const abrirEditar = useCallback((categoria: Categoria, item: any) => {
        setModal({ categoria, itemInicial: item, isOpen: true });
    }, []);

    const fecharModal = useCallback(() => {
        setModal({
            categoria: null,
            itemInicial: null,
            isOpen: false,
        });
    }, []);

    return (
        <UIContext.Provider
            value={{
                leitor,
                abrirLeitor,
                fecharLeitor,
                modal,
                abrirCriar,
                abrirEditar,
                fecharModal,
            }}
        >
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const ctx = useContext(UIContext);
    if (!ctx) throw new Error("useUI deve ser usado dentro de UIProvider");
    return ctx;
}