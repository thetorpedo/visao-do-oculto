import { Button } from "./button"
import { Sparkles } from "lucide-react"

export function ButtonShowcase() {
    const variants = [
        "default",
        "secondary",
        "outline",
        "ghost",
        "destructive",
        "link",
    ] as const

    const textSizes = ["xs", "sm", "default", "lg"] as const
    const iconSizes = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const

    const fonts = [
        { label: "Sans (Source Serif 4)", className: "font-sans" },
        { label: "Special Elite", className: "font-special" },
        { label: "West", className: "font-west" },
        { label: "Optima", className: "font-optima" },
        { label: "Optima Bold", className: "font-optima-bold" },
        { label: "Sigilos", className: "font-sigilos" },
        { label: "Estrangeiro", className: "font-estrangeiro" },
        { label: "Blur", className: "font-blur" },
        { label: "Nightmare", className: "font-nightmare" },
        { label: "Crack", className: "font-crack" },
        { label: "Fluoxetine", className: "font-fluoxetine" },
        { label: "Reappeat", className: "font-reappeat" },
        { label: "Keyes", className: "font-keyes" },
        { label: "Fstein", className: "font-fstein" },
        { label: "Daisy", className: "font-daisy" },
        { label: "Typewriter Bad", className: "font-typewriter-bad" },
        { label: "Tech", className: "font-tech" },
        { label: "Spectral SC", className: "font-spectral" },
        { label: "Road Rage", className: "font-rage" },
        { label: "Protest Revolution", className: "font-protest" },
        { label: "Handwriting", className: "font-handwriting" },
    ] as const

    return (
        <div className="flex flex-col gap-10 p-6">
            {/* 1. Todas as Variantes no tamanho default */}
            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Variantes (Tamanho Default)
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                    {variants.map((variant) => (
                        <Button key={variant} variant={variant}>
                            {variant}
                        </Button>
                    ))}
                </div>
            </section>

            {/* 2. Todos os Tamanhos de Texto */}
            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Tamanhos com Texto
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                    {textSizes.map((size) => (
                        <Button key={size} size={size}>
                            Button ({size})
                        </Button>
                    ))}
                </div>
            </section>

            {/* 3. Tamanhos com Ícones */}
            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Tamanhos de Ícone (Icon Sizes)
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                    {iconSizes.map((size) => (
                        <Button
                            key={size}
                            size={size}
                            variant="outline"
                            aria-label={`Ícone tamanho ${size}`}
                        >
                            <Sparkles />
                        </Button>
                    ))}
                </div>
            </section>

            {/* 4. Amostra de Todas as Fontes */}
            <section className="space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Visualização por Fonte
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fonts.map(({ label, className }) => (
                        <div
                            key={className}
                            className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-3 shadow-xs"
                        >
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-mono text-muted-foreground">
                                    .{className}
                                </span>
                                <span className="text-[11px] text-muted-foreground/70">
                                    {label}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="default" size="sm" className={className}>
                                    Investigar
                                </Button>
                                <Button variant="outline" size="sm" className={className}>
                                    Oculto
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. Matriz Completa (Variante x Tamanho) */}
            <section className="space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Matriz Completa
                </h2>
                <div className="space-y-3">
                    {variants.map((variant) => (
                        <div key={variant} className="flex flex-wrap items-center gap-3">
                            <span className="w-24 text-xs font-mono text-muted-foreground">
                                {variant}:
                            </span>
                            {textSizes.map((size) => (
                                <Button key={`${variant}-${size}`} variant={variant} size={size}>
                                    {size}
                                </Button>
                            ))}
                            {iconSizes.map((size) => (
                                <Button
                                    key={`${variant}-${size}`}
                                    variant={variant}
                                    size={size}
                                    aria-label={`${variant} ${size}`}
                                >
                                    <Sparkles />
                                </Button>
                            ))}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}