export default function Logo({ className = "", size = "default" }: { className?: string, size?: "small" | "default" | "large" }) {
    const dimensions = size === "small" ? { width: 120, height: 32 } : size === "large" ? { width: 240, height: 64 } : { width: 160, height: 42 }

    return (
        <div className={`flex items-center select-none ${className}`}>
            <video
                src="/Logo.mp4"
                width={dimensions.width}
                height={dimensions.height}
                autoPlay
                loop
                muted
                playsInline
                className="object-contain drop-shadow-lg active:scale-95 transition-transform duration-200 pointer-events-none"
            />
        </div>
    )
}
