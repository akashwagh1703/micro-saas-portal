export default function Card({ title, description, children, action, className = '', padding = true }) {
  return (
    <div
      className={`surface-card ${padding ? 'p-5 sm:p-6' : ''} ${className}`}
    >
      {(title || action) && (
        <div className={`flex items-start justify-between gap-4 ${children ? 'mb-5' : ''}`}>
          <div className="min-w-0">
            {title && (
              <h3 className="text-base font-semibold tracking-tight text-slate-900">{title}</h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
