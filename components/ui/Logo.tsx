import Image from "next/image"

export default function Logo({ className = "", size = "default" }: { className?: string, size?: "small" | "default" | "large" }) {
    const dimensions = size === "small" ? { width: 120, height: 45 } : size === "large" ? { width: 240, height: 90 } : { width: 160, height: 60 }

    return (
        <div className={`flex items-center select-none ${className}`}>
            <Image
                src="/Logo.png"
                alt="Slotify Logo"
                width={dimensions.width}
                height={dimensions.height}
                className="object-contain drop-shadow-lg scale-110 active:scale-95 transition-transform duration-200"
                priority
            />
        </div>
    )
}
