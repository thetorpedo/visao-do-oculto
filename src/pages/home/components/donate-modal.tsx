import { X } from "lucide-react";

const PIX_KEY = "ecc154c8-61ba-46ee-8f47-cd9d52df8a33";

export default function DonateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative mx-4 flex w-full max-w-sm flex-col items-center gap-4 border-2 border-gray-800 bg-white p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 transition-colors hover:text-gray-800"
                >
                    <X className="size-4" />
                </button>

                <h2 className="text-center font-special text-xl text-gray-900 uppercase">Faz um pix?</h2>

                <p className="text-center font-sans text-sm leading-relaxed text-gray-600">
                    Se o site foi útil pras suas mesas, considere apoiar o desenvolvimento.
                </p>

                <img src="/assets/qrcode-pix.png" alt="QR Code PIX" className="h-48 w-48 border border-gray-300" />

                <p className="text-center font-daisy text-xs tracking-wider text-gray-400">{PIX_KEY}</p>
            </div>
        </div>
    );
}