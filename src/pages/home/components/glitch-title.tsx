import Logo from "@/pages/home/components/logo";

interface GlitchTitleProps {
    text: string;
    inline?: boolean;
}

export default function GlitchTitle({ text, inline = false }: GlitchTitleProps) {
    const words = text.split(" ");

    const content = words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex whitespace-nowrap">
            {word.split("").map((char, charIndex) => (
                <Logo key={charIndex} char={char} />
            ))}
        </span>
    ));

    if (inline) {
        return <span className="inline-flex flex-wrap justify-center gap-x-2">{content}</span>;
    }

    return (
        <h1 className="flex flex-wrap justify-center gap-x-3 pt-2 pb-2 text-3xl select-none sm:text-5xl md:text-7xl">
            {content}
        </h1>
    );
}