export default function Input({ label, error, hint, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">{label}</label>
      )}
      <input
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 disabled:bg-slate-50 disabled:text-slate-500 ${
          error ? 'border-red-300 focus:border-red-400 focus:ring-red-500/10' : 'border-slate-200'
        } ${className}`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
