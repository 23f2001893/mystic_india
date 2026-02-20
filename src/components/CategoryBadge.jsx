export default function CategoryBadge({ category, size = 'sm' }) {
    const styles = {
        'cosmic-myths': {
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            text: 'text-blue-700 dark:text-blue-300',
            border: 'border-blue-200 dark:border-blue-700',
            label: 'Cosmic Myths',
        },
        'legends-gods': {
            bg: 'bg-orange-100 dark:bg-orange-900/30',
            text: 'text-orange-700 dark:text-orange-300',
            border: 'border-orange-200 dark:border-orange-700',
            label: 'Legends',
        },
        'heroic-journeys': {
            bg: 'bg-red-100 dark:bg-red-900/30',
            text: 'text-red-700 dark:text-red-300',
            border: 'border-red-200 dark:border-red-700',
            label: 'Heroic Journeys',
        },
        'wisdom-sages': {
            bg: 'bg-emerald-100 dark:bg-emerald-900/30',
            text: 'text-emerald-700 dark:text-emerald-300',
            border: 'border-emerald-200 dark:border-emerald-700',
            label: 'Wisdom',
        },
        'divine-love': {
            bg: 'bg-pink-100 dark:bg-pink-900/30',
            text: 'text-pink-700 dark:text-pink-300',
            border: 'border-pink-200 dark:border-pink-700',
            label: 'Divine Love',
        },
        'animals-symbolism': {
            bg: 'bg-amber-100 dark:bg-amber-900/30',
            text: 'text-amber-700 dark:text-amber-300',
            border: 'border-amber-200 dark:border-amber-700',
            label: 'Animals & Symbolism',
        },
        'power-responsibility': {
            bg: 'bg-violet-100 dark:bg-violet-900/30',
            text: 'text-violet-700 dark:text-violet-300',
            border: 'border-violet-200 dark:border-violet-700',
            label: 'Power & Responsibility',
        },
        'hidden-gems': {
            bg: 'bg-cyan-100 dark:bg-cyan-900/30',
            text: 'text-cyan-700 dark:text-cyan-300',
            border: 'border-cyan-200 dark:border-cyan-700',
            label: 'Hidden Gems',
        },
        'modern-lessons': {
            bg: 'bg-teal-100 dark:bg-teal-900/30',
            text: 'text-teal-700 dark:text-teal-300',
            border: 'border-teal-200 dark:border-teal-700',
            label: 'Modern Lessons',
        },
        'festivals': {
            bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30',
            text: 'text-fuchsia-700 dark:text-fuchsia-300',
            border: 'border-fuchsia-200 dark:border-fuchsia-700',
            label: 'Festivals',
        },
        // Fallbacks for backward compatibility or defaults
        devotion: {
            bg: 'bg-pink-100 dark:bg-pink-900/30',
            text: 'text-pink-700 dark:text-pink-300',
            border: 'border-pink-200 dark:border-pink-700',
            label: 'Devotion',
        },
        wisdom: {
            bg: 'bg-violet-100 dark:bg-violet-900/30',
            text: 'text-violet-700 dark:text-violet-300',
            border: 'border-violet-200 dark:border-violet-700',
            label: 'Wisdom',
        },
        sacrifice: {
            bg: 'bg-orange-100 dark:bg-orange-900/30',
            text: 'text-orange-700 dark:text-orange-300',
            border: 'border-orange-200 dark:border-orange-700',
            label: 'Sacrifice',
        },
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    const style = styles[category] || styles['cosmic-myths'];

    return (
        <span
            className={`inline-flex items-center rounded-full border font-medium ${style.bg} ${style.text} ${style.border} ${sizeClasses[size]}`}
        >
            {style.label}
        </span>
    );
}
