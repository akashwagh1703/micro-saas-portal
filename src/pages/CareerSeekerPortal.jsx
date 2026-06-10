import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AutoWaveMark } from '../components/brand/AutoWaveBrand';
import { loadRazorpay } from '../utils/loadRazorpay';

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { Accept: 'application/json' },
});

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }) {
  const styles = {
    trial: 'bg-amber-100 text-amber-800',
    active: 'bg-emerald-100 text-emerald-800',
    expired: 'bg-red-100 text-red-800',
    cancelled: 'bg-slate-100 text-slate-700',
  };
  const labels = {
    trial: 'Free trial',
    active: 'Active',
    expired: 'Expired',
    cancelled: 'Cancelled',
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] || styles.expired}`}
    >
      {labels[status] || status}
    </span>
  );
}

function asList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [];
}

function channelLabel(channels) {
  if (!channels || typeof channels !== 'object') return '';
  const parts = [];
  if (channels.whatsapp === 'sent') parts.push('WhatsApp');
  if (channels.email === 'sent') parts.push('Email');
  if (channels.in_app === 'sent') parts.push('Portal');
  return parts.join(' · ');
}

export default function CareerSeekerPortal() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(null);

  const loadPortal = () => {
    if (!token) {
      setError('Missing portal link. Request a new link on WhatsApp with PORTAL LINK.');
      setLoading(false);
      return Promise.resolve();
    }

    setLoading(true);
    return publicApi
      .get('/career/public/portal', { params: { token } })
      .then((res) => {
        setData(res.data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'This portal link is invalid or expired.');
        setData(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPortal();
  }, [token]);

  const billing = data?.billing;
  const canSubscribe =
    billing?.billing_enabled &&
    billing?.status !== 'active' &&
    billing?.razorpay_configured;

  const startCheckout = async (planType) => {
    setPaying(planType);
    try {
      const { data: checkout } = await publicApi.post('/career/public/billing/subscribe', {
        token,
        plan: planType,
      });
      const Razorpay = await loadRazorpay();

      const rzp = new Razorpay({
        key: checkout.key_id,
        subscription_id: checkout.subscription_id,
        name: 'CareerAI',
        description: planType === 'yearly' ? 'CareerAI — Yearly' : 'CareerAI — Monthly',
        theme: { color: '#059669' },
        handler: async (response) => {
          try {
            await publicApi.post('/career/public/billing/verify', {
              token,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Subscription active! You can use CareerAI on WhatsApp.');
            await loadPortal();
          } catch {
            toast.error('Payment received — refreshing status…');
            await loadPortal();
          }
        },
        modal: {
          ondismiss: () => setPaying(null),
        },
      });

      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
        setPaying(null);
      });

      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start checkout.');
      setPaying(null);
    }
  };

  const profile = data?.profile;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <AutoWaveMark className="h-8 w-8" />
          <div>
            <h1 className="text-lg font-semibold text-slate-900">CareerAI Portal</h1>
            <p className="text-xs text-slate-500">Your jobs, applications & alerts</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {loading && <p className="text-sm text-slate-500">Loading your dashboard…</p>}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {!loading && !error && data && profile && (
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                {profile.full_name || 'Your profile'}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {asList(profile.preferred_roles).join(', ') || 'Job seeker'}
                {profile.current_location ? ` · ${profile.current_location}` : ''}
              </p>
              {asList(profile.skills).length > 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  Skills: {profile.skills.slice(0, 12).join(', ')}
                </p>
              )}
              {data.portal_expires_at && (
                <p className="mt-2 text-xs text-amber-700">
                  Link expires {new Date(data.portal_expires_at).toLocaleDateString()}
                </p>
              )}
            </section>

            {billing?.billing_enabled && (
              <section
                id="subscribe"
                className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
                    Your CareerAI plan
                  </h3>
                  <StatusBadge status={billing.status} />
                </div>

                {billing.status === 'trial' && (
                  <p className="mt-2 text-sm text-emerald-900">
                    Free trial — {billing.days_left} day{billing.days_left === 1 ? '' : 's'} left
                    {billing.trial_ends_at ? ` (ends ${formatDate(billing.trial_ends_at)})` : ''}
                  </p>
                )}

                {billing.status === 'active' && (
                  <p className="mt-2 text-sm text-emerald-900">
                    {billing.plan === 'yearly' ? 'Yearly' : 'Monthly'} plan active
                    {billing.current_period_end
                      ? ` · renews ${formatDate(billing.current_period_end)}`
                      : ''}
                  </p>
                )}

                {(billing.status === 'expired' || billing.status === 'cancelled') && (
                  <p className="mt-2 text-sm text-red-800">
                    Subscribe to unlock job matching, mock interviews, and AI guidance on WhatsApp.
                  </p>
                )}

                {canSubscribe && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={paying === 'monthly'}
                      onClick={() => startCheckout('monthly')}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {paying === 'monthly'
                        ? 'Opening…'
                        : `Monthly · ₹${billing.prices.monthly_inr}`}
                    </button>
                    <button
                      type="button"
                      disabled={paying === 'yearly'}
                      onClick={() => startCheckout('yearly')}
                      className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-emerald-800 ring-1 ring-emerald-300 hover:bg-emerald-50 disabled:opacity-50"
                    >
                      {paying === 'yearly'
                        ? 'Opening…'
                        : `Yearly · ₹${billing.prices.yearly_inr}`}
                    </button>
                  </div>
                )}

                {canSubscribe && !billing.razorpay_configured && (
                  <p className="mt-2 text-xs text-amber-800">
                    Online payments are not configured yet. Reply SUBSCRIBE on WhatsApp or contact
                    support.
                  </p>
                )}
              </section>
            )}

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Top job matches
              </h3>
              {asList(data.matches).length === 0 ? (
                <p className="mt-2 text-sm text-slate-400">No matches yet</p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100">
                  {data.matches.slice(0, 10).map((m) => (
                    <li key={m.id} className="flex items-start justify-between gap-3 py-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {m.job?.title} @ {m.job?.company}
                        </p>
                        <p className="text-xs text-slate-500">
                          {m.job?.location || '—'} · {m.job?.salary_text || '—'}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                        {Math.round(m.score)}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Applications
              </h3>
              {asList(data.applications).length === 0 ? (
                <p className="mt-2 text-sm text-slate-400">No applications yet — reply APPLY on WhatsApp</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {data.applications.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                    >
                      <span>
                        {a.job?.title} @ {a.job?.company}
                      </span>
                      <span className="text-xs font-medium capitalize text-slate-600">{a.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Recent alerts
              </h3>
              {data.digest_opt_out && (
                <p className="mt-2 text-xs text-amber-700">
                  All alerts paused. Reply START DIGEST on WhatsApp to re-enable.
                </p>
              )}
              {asList(data.notifications).length === 0 ? (
                <p className="mt-2 text-sm text-slate-400">No alerts yet</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {data.notifications.slice(0, 10).map((n) => (
                    <li key={n.id} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-slate-800">
                          {n.payload?.title || n.type}
                        </span>
                        <span
                          className={`text-xs capitalize ${
                            n.status === 'sent' ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                        >
                          {n.status}
                        </span>
                      </div>
                      {n.payload?.summary && (
                        <p className="mt-1 text-xs text-slate-600">{n.payload.summary}</p>
                      )}
                      {channelLabel(n.payload?.channels) && (
                        <p className="mt-1 text-xs text-slate-400">
                          via {channelLabel(n.payload.channels)}
                        </p>
                      )}
                      {n.sent_at && (
                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(n.sent_at).toLocaleString()}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <p className="text-center text-xs text-slate-400">
              Need help? Message your career coach on WhatsApp · Reply PORTAL LINK for a fresh link
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
