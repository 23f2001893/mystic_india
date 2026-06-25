import { FiX } from 'react-icons/fi';

export default function AdminModal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-24 backdrop-blur-sm sm:py-28">
            <div className="w-full max-w-5xl rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] px-5 py-4 sm:px-6">
                    <h2 className="font-heading text-2xl text-[var(--text-primary)]">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-saffron/10 hover:text-saffron"
                    >
                        <FiX />
                    </button>
                </div>
                <div className="max-h-[calc(100vh-13rem)] overflow-y-auto p-5 sm:p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
