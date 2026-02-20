export default function DecorativeBorder({ className = '' }) {
    return (
        <div className={`w-full overflow-hidden ${className}`}>
            <svg
                viewBox="0 0 1200 24"
                className="w-full h-6"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF6F00" stopOpacity="0.3" />
                        <stop offset="25%" stopColor="#FFD700" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#FF6F00" stopOpacity="1" />
                        <stop offset="75%" stopColor="#FFD700" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#FF6F00" stopOpacity="0.3" />
                    </linearGradient>
                </defs>
                {/* Repeating temple pattern */}
                {Array.from({ length: 40 }).map((_, i) => (
                    <g key={i} transform={`translate(${i * 30}, 0)`}>
                        <path
                            d="M0,24 L15,0 L30,24"
                            fill="none"
                            stroke="url(#borderGrad)"
                            strokeWidth="1.5"
                        />
                        <circle cx="15" cy="6" r="2" fill="#FFD700" opacity="0.6" />
                    </g>
                ))}
                {/* Center line */}
                <line
                    x1="0"
                    y1="12"
                    x2="1200"
                    y2="12"
                    stroke="url(#borderGrad)"
                    strokeWidth="0.5"
                    opacity="0.3"
                />
            </svg>
        </div>
    );
}
