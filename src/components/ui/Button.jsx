const variants = {
  primary:
    'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:shadow-emerald-600/25 active:scale-[0.98]',
  secondary:
    'border border-slate-200/80 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger:
    'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20 hover:from-red-500 hover:to-rose-500 active:scale-[0.98]',
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  loading = false,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant] || variants.primary} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading…
        </>
      ) : (
        children
      )}
    </button>
  );
}
