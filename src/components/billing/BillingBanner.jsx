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

  if (status === 'pending_verification') {
    return (
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-3.5 shadow-sm">
        <div className="flex items-start gap-3">
          <Clock size={18} className="text-amber-700" />
          <div>
            <p className="text-sm font-medium text-amber-900">UPI payment under review</p>
            <p className="text-xs text-amber-800/90">
              Auto-replies are paused until we verify your payment (usually within 24 hours).
            </p>
          </div>
        </div>
        <Link
          to="/settings?tab=billing"
          className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-amber-900 shadow-sm ring-1 ring-amber-200 hover:bg-amber-50"
        >
          View status
        </Link>
      </div>
    );
  }

  if (status === 'trial') {
    const urgent = days_left <= 3;
    return (
      <div
        className={`mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 shadow-sm ${
          urgent
            ? 'border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50'
            : 'border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-teal-50'
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
    const { cancel_at_period_end, current_period_end } = billing;
    return (
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3.5 shadow-sm">
        <div className="flex items-center gap-3">
          <CreditCard size={18} className="text-emerald-700" />
          <div>
            <p className="text-sm font-medium text-emerald-900">
              Platform plan active · {label}
              {cancel_at_period_end ? ' · cancelling' : ''}
            </p>
            {current_period_end && (
              <p className="text-xs text-slate-600">
                {cancel_at_period_end
                  ? `Access until ${formatDate(current_period_end)}`
                  : `Renews ${formatDate(current_period_end)}`}
              </p>
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

  if (status === 'past_due') {
    return (
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-200/80 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3.5 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-orange-600" />
          <div>
            <p className="text-sm font-medium text-orange-900">Payment issue — action needed</p>
            <p className="text-xs text-orange-800/80">
              {billing.has_access && billing.current_period_end
                ? `Access continues until ${formatDate(billing.current_period_end)}. Update payment in Settings.`
                : 'Renew your subscription to keep auto-replies running.'}
            </p>
          </div>
        </div>
        <Link
          to="/settings?tab=billing"
          className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700"
        >
          Fix billing
        </Link>
      </div>
    );
  }

  if (status === 'expired' || status === 'cancelled') {
    return (
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200/80 bg-gradient-to-r from-red-50 to-rose-50 px-4 py-3.5 shadow-sm">
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

export function BillingSidebarBadge({ billing, dark = false }) {
  if (!billing?.billing_enabled) return null;

  const { status, days_left, plan } = billing;

  const base = dark
    ? 'mt-2 block rounded-xl px-2.5 py-1.5 text-center text-[11px] font-medium ring-1'
    : 'mt-2 rounded-md px-2 py-1 text-center text-[11px] font-medium';

  if (status === 'trial') {
    return (
      <p className={`${base} ${dark ? 'bg-amber-500/15 text-amber-200 ring-amber-400/20' : 'bg-amber-50 text-amber-800'}`}>
        Trial · {days_left}d left
      </p>
    );
  }
  if (status === 'active') {
    return (
      <p className={`${base} ${dark ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/20' : 'bg-emerald-50 text-emerald-800'}`}>
        {plan === 'yearly' ? 'Yearly' : 'Monthly'} plan
      </p>
    );
  }
  if (status === 'past_due') {
    return (
      <Link
        to="/settings?tab=billing"
        className={`${base} ${dark ? 'bg-orange-500/15 text-orange-200 ring-orange-400/20 hover:bg-orange-500/25' : 'block bg-orange-50 text-orange-800 hover:bg-orange-100'}`}
      >
        Payment issue
      </Link>
    );
  }
  if (status === 'pending_verification') {
    return (
      <Link
        to="/settings?tab=billing"
        className={`${base} ${dark ? 'bg-amber-500/15 text-amber-200 ring-amber-400/20 hover:bg-amber-500/25' : 'block bg-amber-50 text-amber-900 hover:bg-amber-100'}`}
      >
        Payment pending
      </Link>
    );
  }
  if (status === 'expired' || status === 'cancelled') {
    return (
      <Link
        to="/settings?tab=billing"
        className={`${base} ${dark ? 'bg-red-500/15 text-red-200 ring-red-400/20 hover:bg-red-500/25' : 'block bg-red-50 text-red-700 hover:bg-red-100'}`}
      >
        Subscribe required
      </Link>
    );
  }
  return null;
}
