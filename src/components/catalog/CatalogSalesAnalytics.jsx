import { useEffect, useState } from 'react';
import { IndianRupee, Package, TrendingDown, TrendingUp } from 'lucide-react';
import Card from '../ui/Card';
import { BarChart, DonutChart, formatInr } from '../admin/AdminCharts';
import { fetchCatalogOrdersAnalytics } from '../../services/catalogApi';

const DAY_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
];

function formatPct(pct) {
  if (pct == null) return '—';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct}%`;
}

export default function CatalogSalesAnalytics({ compact = false }) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchCatalogOrdersAnalytics(days)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setData(null);
          setError(err.response?.data?.message || 'Could not load sales analytics');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const summary = data?.summary;
  const change = data?.previous?.revenue_change_pct;
  const up = change != null && change >= 0;

  const revenueSeries = (data?.series || []).map((row) => ({
    day: row.date,
    value: row.revenue_inr,
  }));

  const statusSegments = (data?.by_status || []).map((row) => ({
    label: String(row.status || '').replace(/_/g, ' '),
    value: row.count,
  }));

  const body = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Sales & income</h2>
          <p className="mt-1 text-xs text-slate-500">
            Paid income = confirmed, ready to ship, shipped, delivered, and completed orders.
            {data?.from && data?.to ? ` · ${data.from} → ${data.to}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {DAY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDays(opt.value)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                days === opt.value
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-slate-500">Loading analytics…</p>
      ) : error ? (
        <p className="mt-4 text-sm text-rose-600">{error}</p>
      ) : summary ? (
        <div className="mt-4 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              icon={IndianRupee}
              label="Paid income"
              value={formatInr(summary.revenue_paid_inr)}
              hint={
                change != null ? (
                  <span
                    className={`inline-flex items-center gap-1 ${
                      up ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {formatPct(change)} vs prior {days}d
                  </span>
                ) : (
                  'vs prior period'
                )
              }
            />
            <Metric
              icon={Package}
              label="Paid orders"
              value={String(summary.orders_paid)}
              hint={`of ${summary.orders_total} total · avg ${formatInr(summary.avg_order_value_inr)}`}
            />
            <Metric
              label="Pending verify"
              value={formatInr(summary.revenue_pending_verification_inr)}
              hint="Awaiting your confirmation"
            />
            <Metric
              label="Pipeline"
              value={`${summary.orders_ready_to_ship} / ${summary.orders_shipped} / ${summary.orders_delivered}`}
              hint="Ready · shipped · delivered"
            />
          </div>

          {!compact ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <BarChart
                  title="Daily paid income"
                  data={revenueSeries}
                  color="emerald"
                  formatValue={formatInr}
                />
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <DonutChart title="Orders by status" segments={statusSegments} />
              </div>
            </div>
          ) : null}

          {!compact && data.top_products?.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-900">Top products (paid)</p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase text-slate-400">
                    <tr>
                      <th className="pb-2 font-medium">Product</th>
                      <th className="pb-2 font-medium">Orders</th>
                      <th className="pb-2 font-medium">Income</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.top_products.map((p) => (
                      <tr key={`${p.product_id}-${p.product_name}`}>
                        <td className="py-2 text-slate-800">{p.product_name}</td>
                        <td className="py-2 text-slate-600">{p.orders}</td>
                        <td className="py-2 font-medium text-slate-900">
                          {formatInr(p.revenue_inr)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );

  if (compact) {
    return <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3">{body}</div>;
  }
  return <Card className="!p-5">{body}</Card>;
}

function Metric({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">
      <div className="flex items-center gap-2">
        {Icon ? (
          <span className="rounded-lg bg-emerald-50 p-1.5 text-emerald-700">
            <Icon size={14} />
          </span>
        ) : null}
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
      {hint ? <div className="mt-1 text-[11px] text-slate-500">{hint}</div> : null}
    </div>
  );
}
