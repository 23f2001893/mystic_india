import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import StoriesSidebar from '../components/StoriesSidebar';

export default function StoriesLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen flex">
            {/* Desktop sidebar — fixed, touching left edge, below navbar */}
            <aside className="hidden lg:flex flex-col fixed left-0 top-16 sm:top-20 bottom-0 w-80 border-r border-[var(--border-color)] bg-[var(--bg-card)] overflow-y-auto z-30">
                <StoriesSidebar onClose={() => {}} />
            </aside>

            {/* Mobile drawer overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-40 flex">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative flex flex-col w-72 max-w-[85vw] h-full bg-[var(--bg-card)] border-r border-[var(--border-color)] overflow-y-auto z-50">
                        <StoriesSidebar onClose={() => setMobileOpen(false)} />
                    </aside>
                </div>
            )}

            {/* Main content — offset by sidebar width on desktop */}
            <div className="lg:ml-80 flex-1 min-w-0">
                {/* Mobile menu FAB */}
                <button
                    onClick={() => setMobileOpen(true)}
                    className="lg:hidden fixed bottom-6 left-4 z-30 inline-flex items-center justify-center h-12 w-12 rounded-full bg-saffron text-white shadow-lg shadow-saffron/30 transition-transform hover:scale-105"
                    aria-label="Open navigation"
                >
                    <FiMenu className="text-xl" />
                </button>

                <Outlet />
            </div>
        </div>
    );
}
