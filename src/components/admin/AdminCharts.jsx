function maxValue(data) {
  return Math.max(1, ...data.map((d) => d.value ?? 0));
}

function shortDay(day) {
  if (!day) return '';
  const d = new Date(`${day}T00:00:00`);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function BarChart({ title, data, color = 'emerald', formatValue }) {
  const peak = maxValue(data);
  const fmt = formatValue ?? ((v) => String(v));

  return (
    <div className="space-y-3">
      {title && <p className="text-sm font-semibold text-slate-900">{title}</p>}
      <div className="flex h-40 items-end gap-1">
        {data.map((row) => {
          const height = Math.max(4, Math.round((row.value / peak) * 100));
          return (
            <div key={row.day} className="group flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md transition-all group-hover:opacity-80"
                style={{
                  height: `${height}%`,
                  backgroundColor:
                    color === 'violet'
                      ? '#8b5cf6'
                      : color === 'blue'
                        ? '#3b82f6'
                        : '#10b981',
                }}
                title={`${shortDay(row.day)}: ${fmt(row.value)}`}
              />
              {data.length <= 14 && (
                <span className="hidden text-[9px] text-slate-400 sm:block">
                  {shortDay(row.day).split(' ')[0]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const DONUT_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#94a3b8'];

export function DonutChart({ title, segments }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let cursor = 0;
  const stops = segments
    .filter((s) => s.value > 0)
    .map((seg, i) => {
      const pct = (seg.value / total) * 100;
      const start = cursor;
      cursor += pct;
      return `${DONUT_COLORS[i % DONUT_COLORS.length]} ${start}% ${cursor}%`;
    })
    .join(', ');

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div
        className="mx-auto h-28 w-28 shrink-0 rounded-full"
        style={{
          background: stops ? `conic-gradient(${stops})` : '#e2e8f0',
          mask: 'radial-gradient(farthest-side, transparent 58%, #000 59%)',
          WebkitMask: 'radial-gradient(farthest-side, transparent 58%, #000 59%)',
        }}
        aria-hidden
      />
      <div className="flex-1 space-y-2">
        {title && <p className="text-sm font-semibold text-slate-900">{title}</p>}
        {segments.map((seg, i) => (
          <div key={seg.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
              />
              {seg.label}
            </span>
            <span className="font-medium text-slate-900">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function formatInr(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}
