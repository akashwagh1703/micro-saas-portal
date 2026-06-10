export default function PageHeader({ eyebrow, title, description, action, children, className = '' }) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>
        )}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
