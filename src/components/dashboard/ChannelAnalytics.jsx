import Card from '../ui/Card';

function formatDayLabel(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
}

function MiniBars({ series, waKey, igKey, label }) {
  const max = Math.max(
    1,
    ...series.flatMap((day) => [day[waKey] ?? 0, day[igKey] ?? 0]),
  );

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-slate-500">{label}</p>
      <div className="flex items-end gap-1.5 h-20">
        {series.map((day) => {
          const wa = day[waKey] ?? 0;
          const ig = day[igKey] ?? 0;
          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-0.5" title={`${day.date}: WA ${wa}, IG ${ig}`}>
              <div className="flex w-full items-end justify-center gap-0.5 h-14">
                <div
                  className="w-2 rounded-t bg-emerald-500"
                  style={{ height: `${Math.max(4, (wa / max) * 100)}%` }}
                />
                <div
                  className="w-2 rounded-t bg-pink-500"
                  style={{ height: `${Math.max(4, (ig / max) * 100)}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-400">{formatDayLabel(day.date)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ChannelAnalytics({ analytics }) {
  if (!analytics?.series?.length) {
    return null;
  }

  const { series, totals, days } = analytics;
  const totalInbound = totals.whatsapp_inbound + totals.instagram_inbound;
  const waShare = totalInbound > 0 ? Math.round((totals.whatsapp_inbound / totalInbound) * 100) : 0;
  const igShare = totalInbound > 0 ? 100 - waShare : 0;

  return (
    <Card title={`Channel analytics (${days} days)`}>
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <div>
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-1.5" />
          WhatsApp: {totals.whatsapp_inbound} in · {totals.whatsapp_outbound} out · {totals.whatsapp_leads} leads
        </div>
        <div>
          <span className="inline-block h-2 w-2 rounded-full bg-pink-500 mr-1.5" />
          Instagram: {totals.instagram_inbound} in · {totals.instagram_outbound} out · {totals.instagram_leads} leads
        </div>
      </div>

      {totalInbound > 0 && (
        <div className="mb-5">
          <p className="mb-1 text-xs text-slate-500">Inbound mix</p>
          <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="bg-emerald-500" style={{ width: `${waShare}%` }} />
            <div className="bg-pink-500" style={{ width: `${igShare}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-400">{waShare}% WhatsApp · {igShare}% Instagram</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <MiniBars series={series} waKey="whatsapp_inbound" igKey="instagram_inbound" label="Inbound messages" />
        <MiniBars series={series} waKey="whatsapp_leads" igKey="instagram_leads" label="Leads captured" />
      </div>
    </Card>
  );
}
