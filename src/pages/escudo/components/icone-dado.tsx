import type { ReactNode, SVGProps } from "react";

/** Arestas internas (faces) desenhadas um pouco mais finas e suaves que o contorno. */
const ARESTA: SVGProps<SVGGElement> = { strokeWidth: 1.1, opacity: 0.75 };

function D10Forma() {
    return (
        <>
            <path d="M12 2 21.5 10v4L12 22l-9.5-8v-4Z" />
            <g {...ARESTA}>
                <path d="M12 2 7 13M12 2l5 11" />
                <path d="M2.5 14 7 13l5 2 5-2 4.5 1" />
                <path d="M12 15v7" />
            </g>
        </>
    );
}

const FORMAS: Record<number, ReactNode> = {
    4: (
        <>
            <path d="M12 2.5 21.5 19.5h-19Z" />
            <path {...ARESTA} d="M12 2.5V14M2.5 19.5 12 14l9.5 5.5" />
        </>
    ),
    6: (
        <>
            <path d="M12 2.5 20.5 7.25v9.5L12 21.5l-8.5-4.75v-9.5Z" />
            <path {...ARESTA} d="M3.5 7.25 12 12l8.5-4.75M12 12v9.5" />
        </>
    ),
    8: (
        <>
            <path d="M12 2 21 12 12 22 3 12Z" />
            <path {...ARESTA} d="M3 12l9 2.5 9-2.5M12 2v20" />
        </>
    ),
    10: <D10Forma />,
    12: (
        <>
            <path d="M12 2l5.88 1.91 3.63 5v6.18l-3.63 5L12 22l-5.88-1.91-3.63-5V8.91l3.63-5Z" />
            <g {...ARESTA}>
                <path d="M12 6.5l5.23 3.8-2 6.15H8.77l-2-6.15Z" />
                <path d="M12 6.5V2M17.23 10.3l4.28-1.39M15.23 16.45l2.65 3.64M8.77 16.45l-2.65 3.64M6.77 10.3 2.49 8.91" />
            </g>
        </>
    ),
    20: (
        <>
            <path d="M12 2l8.66 5v10L12 22l-8.66-5V7Z" />
            <g {...ARESTA}>
                <path d="M12 7.5 17.5 16h-11Z" />
                <path d="M12 2v5.5M3.34 7 12 7.5l8.66-.5M3.34 7l3.16 9M20.66 7l-3.16 9" />
                <path d="M3.34 17l3.16-1M20.66 17l-3.16-1M6.5 16 12 22l5.5-6" />
            </g>
        </>
    ),
    100: (
        <>
            {/* d10 de trás (dezenas), deslocado e esmaecido */}
            <g transform="translate(9 0) scale(0.62)" opacity={0.55} strokeWidth={2.4}>
                <D10Forma />
            </g>
            {/* d10 da frente (unidades) */}
            <g transform="translate(0 6.5) scale(0.72)" strokeWidth={2.2}>
                <D10Forma />
            </g>
        </>
    ),
};

export default function IconeDado({ faces, className = "size-5" }: { faces: number; className?: string }) {
    const forma = FORMAS[faces];
    if (!forma) return null;

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {forma}
        </svg>
    );
}
