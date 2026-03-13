
export default function Logo({ className = "", size = "default", variant = "light" }: { className?: string, size?: "small" | "default" | "large", variant?: "light" | "dark" }) {
    const scale = size === "small" ? 0.7 : size === "large" ? 1.5 : 1
    const color = variant === "light" ? "white" : "black"
    const stroke = variant === "light" ? "black" : "white"

    return (
        <div className={`flex items-center select-none ${className}`}>
            <svg 
                width={160 * scale} 
                height={60 * scale} 
                viewBox="0 0 160 60" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
            >
                {/* Main Logo Group */}
                <g filter="url(#dropShadow)">
                    {/* Shadow/Sticker Border Effect */}
                    <path 
                        d="M15 45 Q 12 45 10 42 Q 7 38 8 32 Q 9 20 25 20 Q 30 20 35 22 Q 40 18 50 18 Q 70 18 80 22 Q 100 22 110 30 Q 120 20 135 20 Q 155 20 155 40 Q 155 55 130 55 Q 100 55 80 50 Q 60 55 40 55 Q 20 55 15 45" 
                        fill="white" 
                        stroke="rgba(0,0,0,0.1)" 
                        strokeWidth="2"
                    />
                    
                    {/* Text 'Slotify' - Hand-crafted paths for branding accuracy */}
                    <text 
                        x="15" 
                        y="42" 
                        fontFamily="system-ui, -apple-system, sans-serif" 
                        fontWeight="900" 
                        fontSize="32" 
                        fill="black"
                        letterSpacing="-1"
                    >
                        Slotify
                    </text>

                    {/* The signature Diamond 'P' marker */}
                    <path 
                        d="M135 15 L143 23 L135 31 L127 23 Z" 
                        fill="black" 
                    />
                    <text 
                        x="132" 
                        y="26" 
                        fontFamily="system-ui, -apple-system, sans-serif" 
                        fontWeight="900" 
                        fontSize="10" 
                        fill="white"
                    >
                        P
                    </text>

                    {/* Bottom Swash */}
                    <path 
                        d="M70 48 Q 110 52 145 42" 
                        stroke="black" 
                        strokeWidth="5" 
                        strokeLinecap="round"
                        fill="none"
                    />
                </g>

                <defs>
                    <filter id="dropShadow" x="0" y="0" width="200" height="100">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
                    </filter>
                </defs>
            </svg>
        </div>
    )
}
