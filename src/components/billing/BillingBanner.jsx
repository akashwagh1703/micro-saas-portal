import { Link } from 'react-router-dom';
import { AlertCircle, Clock, CreditCard } from 'lucide-react';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function BillingBanner({ billing, onRefresh }) {
  if (!billing?.billing_enabled) return null;

  const { status, days_left, trial_ends_at, current_period_end, plan } = billing;

  if (status === 'trial') {
    const urgent = days_left <= 3;
    return (
      <div
        className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
          urgent ? 'border-amber-300 bg-amber-50' : 'border-emerald-200 bg-emerald-50'
        }`}
      >
        <div className="flex items-start gap-3">
          <Clock size={18} className={urgent ? 'text-amber-700' : 'text-emerald-700'} />
          <div>
            <p className={`text-sm font-medium ${urgent ? 'text-amber-900' : 'text-emerald-900'}`}>
              Free trial — {days_left} day{days_left === 1 ? '' : 's'} left
            </p>
            <p className="text-xs text-slate-600">
              Full access until {formatDate(trial_ends_at)}. Subscribe anytime to keep your bots running.
            </p>
          </div>
        </div>
        <Link
          to="/settings?tab=billing"
          className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-emerald-800 shadow-sm ring-1 ring-emerald-200 hover:bg-emerald-50"
        >
          View plan
        </Link>
      </div>
    );
  }

  if (status === 'active') {
    const label = plan === 'yearly' ? 'Yearly' : 'Monthly';
    return (
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <CreditCard size={18} className="text-emerald-700" />
          <div>
            <p className="text-sm font-medium text-emerald-900">Platform plan active · {label}</p>
            {current_period_end && (
              <p className="text-xs text-slate-600">Renews {formatDate(current_period_end)}</p>
            )}
          </div>
        </div>
        <Link
          to="/settings?tab=billing"
          className="text-sm font-medium text-emerald-800 hover:underline"
        >
          Manage
        </Link>
      </div>
    );
  }

  if (status === 'expired' || status === 'cancelled') {
    return (
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-900">
              {status === 'cancelled' ? 'Subscription ended' : 'Trial ended'}
            </p>
            <p className="text-xs text-red-800/80">
              Auto-replies are paused. Subscribe to go live again.
            </p>
          </div>
        </div>
        <Link
          to="/settings?tab=billing"
          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
        >
          Subscribe now
        </Link>
      </div>
    );
  }

  return null;
}

export function BillingSidebarBadge({ billing }) {
  if (!billing?.billing_enabled) return null;

  const { status, days_left, plan } = billing;

  if (status === 'trial') {
    return (
      <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-center text-[11px] font-medium text-amber-800">
        Trial · {days_left}d left
      </p>
    );
  }
  if (status === 'active') {
    return (
      <p className="mt-2 rounded-md bg-emerald-50 px-2 py-1 text-center text-[11px] font-medium text-emerald-800">
        {plan === 'yearly' ? 'Yearly' : 'Monthly'} plan
      </p>
    );
  }
  if (status === 'expired' || status === 'cancelled') {
    return (
      <Link
        to="/settings?tab=billing"
        className="mt-2 block rounded-md bg-red-50 px-2 py-1 text-center text-[11px] font-medium text-red-700 hover:bg-red-100"
      >
        Subscribe required
      </Link>
    );
  }
  return null;
}
