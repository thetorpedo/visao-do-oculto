const FINO = { opacity: 0.65, strokeWidth: 1.2 };

export default function IconeDado({ faces, className = "size-5" }: { faces: number; className?: string }) {
    const base = {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.6,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        className,
    };

    switch (faces) {
        case 4:
            return (
                <svg {...base}>
                    <polygon points="12 3 22 20 2 20" />
                    <polyline points="12 3 12 14 2 20" {...FINO} />
                    <line x1="12" y1="14" x2="22" y2="20" {...FINO} />
                </svg>
            );
        case 6:
            return (
                <svg {...base}>
                    <polygon points="12 2 21 7 21 17 12 22 3 17 3 7" />
                    <polyline points="3 7 12 12 21 7" {...FINO} />
                    <line x1="12" y1="12" x2="12" y2="22" {...FINO} />
                </svg>
            );
        case 8:
            return (
                <svg {...base}>
                    <polygon points="12 2 21 12 12 22 3 12" />
                    <polyline points="3 12 12 16 21 12" {...FINO} />
                    <line x1="12" y1="2" x2="12" y2="16" {...FINO} />
                </svg>
            );
        case 10:
            return (
                <svg {...base}>
                    <polygon points="12 2 21 10 12 22 3 10" />
                    <polyline points="3 10 12 14 21 10" {...FINO} />
                    <line x1="12" y1="2" x2="12" y2="14" {...FINO} />
                    <line x1="12" y1="14" x2="12" y2="22" {...FINO} />
                </svg>
            );
        case 12:
            return (
                <svg {...base}>
                    <polygon points="12 2 22 9.5 18.2 21 5.8 21 2 9.5" />
                    <polygon points="12 7 17 10.7 15 16.5 9 16.5 7 10.7" {...FINO} />
                    <line x1="12" y1="2" x2="12" y2="7" {...FINO} />
                    <line x1="22" y1="9.5" x2="17" y2="10.7" {...FINO} />
                    <line x1="18.2" y1="21" x2="15" y2="16.5" {...FINO} />
                    <line x1="5.8" y1="21" x2="9" y2="16.5" {...FINO} />
                    <line x1="2" y1="9.5" x2="7" y2="10.7" {...FINO} />
                </svg>
            );
        case 20:
            return (
                <svg {...base}>
                    <polygon points="12 2 21 7 21 17 12 22 3 17 3 7" />
                    <polygon points="12 7 17.5 16.5 6.5 16.5" {...FINO} />
                    <line x1="12" y1="2" x2="12" y2="7" {...FINO} />
                    <line x1="21" y1="7" x2="17.5" y2="16.5" {...FINO} />
                    <line x1="3" y1="7" x2="6.5" y2="16.5" {...FINO} />
                    <line x1="21" y1="17" x2="17.5" y2="16.5" {...FINO} />
                    <line x1="3" y1="17" x2="6.5" y2="16.5" {...FINO} />
                    <line x1="12" y1="22" x2="6.5" y2="16.5" {...FINO} />
                    <line x1="12" y1="22" x2="17.5" y2="16.5" {...FINO} />
                </svg>
            );
        case 100:
            return (
                <svg {...base}>
                    <polygon points="8 3 14.5 8.5 8 20 1.5 8.5" />
                    <polyline points="1.5 8.5 8 11.5 14.5 8.5" {...FINO} />
                    <polygon points="16.5 6 22.5 11 16.5 21 10.5 11" opacity="0.9" />
                    <polyline points="10.5 11 16.5 13.8 22.5 11" {...FINO} />
                </svg>
            );
        default:
            return null;
    }
}
