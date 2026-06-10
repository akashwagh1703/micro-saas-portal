export default function StatCard({ icon: Icon, label, value, accent = 'emerald', className = '' }) {
  const accents = {
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    violet: 'bg-violet-50 text-violet-600 ring-violet-100',
    amber: 'bg-amber-50 text-amber-600 ring-amber-100',
    rose: 'bg-rose-50 text-rose-600 ring-rose-100',
    slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  };

  return (
    <div className={`surface-card surface-card-hover p-5 ${className}`}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${accents[accent] || accents.emerald}`}>
            <Icon size={22} strokeWidth={1.75} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">{value ?? '—'}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
