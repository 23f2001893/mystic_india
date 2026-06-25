import { NavLink } from 'react-router-dom';
import { FiFolder, FiGrid, FiList, FiSettings } from 'react-icons/fi';

const adminLinks = [
    { path: '/admin/stories', label: 'STORY', description: 'Manage stories', icon: FiSettings },
    { path: '/admin/categories', label: 'CATEGORY', description: 'Manage categories', icon: FiSettings },
];

export default function AdminSidePanel() {
    return (
        <aside className="border-b border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg lg:sticky lg:top-20 lg:min-h-[calc(100vh-5rem)] lg:border-b-0 lg:border-r">
            <div className="flex h-full flex-col gap-6 px-4 py-5">
                <div className="hidden lg:block">
                    {/* <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-saffron/10 text-saffron">
                        <FiGrid />
                    </div> */}
                    <div className="mb-4 border-b border-[var(--border-color)] pb-4">
                    <p className="inline-flex rounded-md bg-saffron/10 px-10 py-2 text-md font-semibold  text-saffron">
                        Admin Panel
                    </p>
                    </div>
                    {/* <h2 className="mt-1 font-heading text-xl text-[var(--text-primary)]">
                        Manage Content
                    </h2> */}
                </div>

                <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                    {adminLinks.map(({ path, label, description, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) =>
                                `group inline-flex min-w-fit items-center gap-3 rounded-lg border px-3 py-3 text-sm font-semibold transition-all lg:min-w-0 ${
                                    isActive
                                        ? 'border-saffron bg-saffron text-white shadow-md'
                                        : 'border-transparent text-[var(--text-secondary)] hover:border-saffron/30 hover:bg-saffron/10 hover:text-saffron'
                                }`
                            }
                        >
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black/5 text-base group-[.active]:bg-white/15">
                                <Icon />
                            </span>
                            <span className="text-left">
                                <span className="block">{label}</span>
                                <span className="hidden text-xs font-normal opacity-75 lg:block">{description}</span>
                            </span>
                        </NavLink>
                    ))}
                </nav>
            </div>
        </aside>
    );
}
