export default function Logo({ className = "", size = "default" }: { className?: string, size?: "small" | "default" | "large" }) {
    const dimensions = size === "small" ? 
        { width: 140, height: 40 } : 
        size === "large" ? 
        { width: 280, height: 80 } : 
        { width: 180, height: 50 };

    return (
        <div className={`flex items-center justify-center overflow-hidden rounded-lg bg-transparent ${className}`}>
            <video
                src="/Logo.mp4"
                width={dimensions.width}
                height={dimensions.height}
                autoPlay
                loop
                muted
                playsInline
                className="object-cover mix-blend-screen brightness-125 contrast-125 saturate-150 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] filter active:scale-95 transition-all duration-300 pointer-events-none"
                style={{ 
                    maxWidth: '100%', 
                    height: 'auto',
                    transform: 'scale(1.2)' // Zoom in slightly to remove potential edges
                }}
            />
        </div>
    )
}
