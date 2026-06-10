import { PORTAL_HIGHLIGHTS } from './portalFeatures';

/** Compact “what’s inside” strip — used on the login form side & mobile. */
export default function AuthQuickHighlights({ compact = false, className = '' }) {
  return (
    <div className={className}>
      {!compact && (
        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          What you get inside
        </p>
      )}
      <div
        className={
          compact
            ? 'flex gap-2 overflow-x-auto pb-1 scrollbar-none'
            : 'grid grid-cols-3 gap-2 sm:grid-cols-6'
        }
      >
        {PORTAL_HIGHLIGHTS.filter((item) => item.id !== 'settings').map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={
                compact
                  ? 'flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/80'
                  : 'flex flex-col items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/60 px-2 py-2.5 text-center shadow-sm backdrop-blur-sm'
              }
              title={item.line}
            >
              <Icon
                size={compact ? 16 : 18}
                strokeWidth={1.75}
                className={compact ? 'text-emerald-400' : 'text-emerald-600'}
              />
              <span className={`font-medium ${compact ? 'whitespace-nowrap text-xs' : 'text-[10px] leading-tight text-slate-600'}`}>
                {item.title}
              </span>
            </div>
          );
        })}
        {!compact && (() => {
          const settings = PORTAL_HIGHLIGHTS.find((i) => i.id === 'settings');
          const Icon = settings.icon;
          return (
            <div
              className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/60 px-2 py-2.5 text-center shadow-sm backdrop-blur-sm"
              title={settings.line}
            >
              <Icon size={18} strokeWidth={1.75} className="text-emerald-600" />
              <span className="text-[10px] font-medium leading-tight text-slate-600">Settings</span>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
