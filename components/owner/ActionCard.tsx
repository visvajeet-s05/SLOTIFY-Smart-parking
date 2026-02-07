import { ReactNode } from "react"
import Link from "next/link"
import { LucideIcon } from "lucide-react"

interface ActionCardProps {
  title: string
  description: string
  href?: string
  icon?: LucideIcon
  color?: string
  onClick?: () => void
  className?: string
}

export function ActionCard({
  title,
  description,
  href,
  icon: Icon,
  color = "from-blue-500 to-blue-600",
  onClick,
  className = ""
}: ActionCardProps) {
  const content = (
    <div className={`group bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/50 cursor-pointer ${className}`}>
      <div className="flex items-center justify-between mb-4">
        {Icon && (
          <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        )}
        <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-gray-700 transition-colors duration-300">
          <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  )

  if (href) {
    return (
      <Link href={href}>
        {content}
      </Link>
    )
  }

  return (
    <div onClick={onClick}>
      {content}
    </div>
  )
}
