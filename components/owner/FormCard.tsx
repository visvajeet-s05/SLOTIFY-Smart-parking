import { ReactNode } from "react"

interface FormCardProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  footer?: ReactNode
}

export function FormCard({
  title,
  description,
  children,
  className = "",
  footer
}: FormCardProps) {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl p-6 ${className}`}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-400">{description}</p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {children}
      </div>

      {footer && (
        <div className="mt-6 pt-6 border-t border-gray-800">
          {footer}
        </div>
      )}
    </div>
  )
}
