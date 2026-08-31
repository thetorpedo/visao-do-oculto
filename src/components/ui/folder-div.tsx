import { ReactNode } from "react";

interface FolderDivProps {
    children: ReactNode;
    className?: string;
}

export default function FolderDiv({ children, className = "" }: FolderDivProps) {
    return (
        <div className={`relative bg-[#837156] bg-[url(/assets/folder.jpg)] bg-blend-overlay bg-size-[30%] p-2 sm:p-6 lg:p-6 shadow-2xl/90 rounded-lg w-full ${className}`}>
            <div className="relative group h-full">
                <div
                    className={`relative flex flex-col z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300 `}
                >
                    {children}
                </div>

                <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%] pointer-events-none" />
            </div>
        </div>
    );
}