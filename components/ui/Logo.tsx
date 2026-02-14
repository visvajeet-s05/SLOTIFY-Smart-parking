
import { Car } from "lucide-react"

export default function Logo({ className = "", size = "default" }: { className?: string, size?: "small" | "default" | "large" }) {
    const isSmall = size === "small"

    return (
        <div className={`flex items-center gap-2 font-black tracking-tighter select-none ${className}`}>
            <div className="relative">
                {/* Car Icon with Speed Lines */}
                <div className={`bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-lg transform -skew-x-12 flex items-center justify-center shadow-lg shadow-cyan-500/20 ${isSmall ? 'w-8 h-8' : 'w-10 h-10'}`}>
                    <Car className={`text-white transform skew-x-12 ${isSmall ? 'w-5 h-5' : 'w-6 h-6'}`} strokeWidth={2.5} />
                </div>
                {/* Speed motion effect */}
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-4 h-full overflow-hidden opacity-50">
                    <div className="w-full h-[2px] bg-cyan-400 mb-1 animate-pulse" />
                    <div className="w-2/3 h-[2px] bg-blue-500 animate-pulse delay-75" />
                </div>
            </div>

            <div className={`flex flex-col justify-center leading-none ${isSmall ? 'hidden md:flex' : 'flex'}`}>
                <span className={`text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400 ${isSmall ? 'text-xl' : 'text-2xl'}`}>
                    Slotify
                </span>
                {!isSmall && (
                    <span className="text-[0.6rem] text-cyan-400 font-bold uppercase tracking-[0.3em] ml-0.5">
                        Smart Parking
                    </span>
                )}
            </div>
        </div>
    )
}
