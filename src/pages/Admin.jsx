import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  UserPlus,
  CreditCard,
  Search,
  X,
  IndianRupee,
  TrendingUp,
  MessageCircle,
  LayoutDashboard,
  Receipt,
  QrCode,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import { BarChart, DonutChart, formatInr } from '../components/admin/AdminCharts';
import AdminPaymentReviews from '../components/admin/AdminPaymentReviews';
import AdminSubscriptionControls from '../components/admin/AdminSubscriptionControls';
import AdminUserPendingPayment from '../components/admin/AdminUserPendingPayment';
import { formatBillingEventType } from '../components/admin/adminBillingHelpers';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'payments', label: 'UPI payments', icon: QrCode },
  { id: 'users', label: 'Users & plans', icon: Users },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusPill({ status }) {
  const styles = {
    trial: 'bg-amber-100 text-amber-800',
    active: 'bg-emerald-100 text-emerald-800',
    expired: 'bg-red-100 text-red-800',
    cancelled: 'bg-slate-100 text-slate-700',
    pending_verification: 'bg-amber-100 text-amber-900',
    captured: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-red-100 text-red-800',
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[status] || 'bg-slate-100 text-slate-700'}`}
    >
      {status || 'unknown'}
    </span>
  );
}

function PlanBadge({ plan }) {
  if (!plan) return <span className="text-slate-400">—</span>;
  const styles =
    plan === 'yearly'
      ? 'bg-violet-100 text-violet-800'
      : 'bg-blue-100 text-blue-800';
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles}`}>
      {plan}
    </span>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState({ items: [], total: 0, page: 1, per_page: 20 });
  const [transactions, setTransactions] = useState({
    items: [],
    total: 0,
    page: 1,
    per_page: 25,
    total_amount_inr: 0,
  });
  const [search, setSearch] = useState('');
  const [userStatus, setUserStatus] = useState('');
  const [userPlan, setUserPlan] = useState('');
  const [txSearch, setTxSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadOverview = useCallback(async () => {
    const { data } = await api.get('/admin/overview');
    setOverview(data);
  }, []);

  const loadAnalytics = useCallback(async () => {
    const { data } = await api.get('/admin/analytics', { params: { days: 30 } });
    setAnalytics(data);
  }, []);

  const loadUsers = useCallback(
    async (page = 1, q = search, status = userStatus, plan = userPlan) => {
      const { data } = await api.get('/admin/users', {
        params: {
          page,
          search: q || undefined,
          status: status || undefined,
          plan: plan || undefined,
        },
      });
      setUsers(data);
    },
    [search, userStatus, userPlan],
  );

  const loadTransactions = useCallback(async (page = 1, q = txSearch) => {
    const { data } = await api.get('/admin/transactions', {
      params: { page, search: q || undefined },
    });
    setTransactions(data);
  }, [txSearch]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadOverview(), loadAnalytics(), loadUsers(1), loadTransactions(1)]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load admin dashboard');
    } finally {
      setLoading(false);
    }
  }, [loadOverview, loadAnalytics, loadUsers, loadTransactions]);

  useEffect(() => {
    load();
  }, [load]);

  const openUser = async (id) => {
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/admin/users/${id}`);
      setSelected(data);
    } catch {
      toast.error('Could not load user');
    } finally {
      setDetailLoading(false);
    }
  };

  const runSubscriptionAction = async (payload) => {
    if (!selected) return;
    setActionLoading(true);
    try {
      const { data } = await api.patch(`/admin/users/${selected.id}/subscription`, payload);
      toast.success('Subscription updated');
      await openUser(selected.id);
      loadUsers(users.page);
      loadOverview();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const runAccessAction = async (payload) => {
    if (!selected) return;
    setActionLoading(true);
    try {
      const { data } = await api.patch(`/admin/users/${selected.id}/access`, payload);
      setSelected(data);
      toast.success('User access updated');
      loadUsers(users.page);
      loadOverview();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const onSearchUsers = (e) => {
    e.preventDefault();
    loadUsers(1);
  };

  const onSearchTx = (e) => {
    e.preventDefault();
    loadTransactions(1);
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading admin dashboard…</p>;
  }

  const statusSegments = analytics
    ? [
        { label: 'Active', value: analytics.status_breakdown?.active ?? 0 },
        { label: 'Trial', value: analytics.status_breakdown?.trial ?? 0 },
        {
          label: 'Pending UPI',
          value: analytics.status_breakdown?.pending_verification ?? 0,
        },
        { label: 'Cancelled', value: analytics.status_breakdown?.cancelled ?? 0 },
        { label: 'Expired', value: analytics.status_breakdown?.expired ?? 0 },
      ]
    : [];

  const planSegments = analytics
    ? [
        { label: 'Monthly', value: analytics.plan_breakdown?.monthly ?? 0 },
        { label: 'Yearly', value: analytics.plan_breakdown?.yearly ?? 0 },
        { label: 'No plan', value: analytics.plan_breakdown?.none ?? 0 },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Super admin"
        title="Platform admin"
        description="Revenue, subscriptions, transactions, and every registered operator in one place."
        action={
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50"
          >
            My operator dashboard →
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              tab === id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && overview && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
            <StatCard icon={Users} label="Total users" value={overview.total_users} accent="violet" />
            <StatCard icon={UserPlus} label="New this week" value={overview.new_this_week} accent="emerald" />
            <StatCard icon={CreditCard} label="Active plans" value={overview.active_subscriptions} accent="blue" />
            <StatCard icon={Shield} label="On trial" value={overview.on_trial} accent="amber" />
            <StatCard
              icon={QrCode}
              label="Pending UPI"
              value={overview.pending_payment_submissions ?? 0}
              accent="amber"
            />
            <StatCard
              icon={Shield}
              label="Awaiting verification"
              value={overview.pending_verification_users ?? 0}
              accent="amber"
            />
            <StatCard
              icon={Receipt}
              label="UPI approved (MTD)"
              value={overview.manual_payments_mtd ?? 0}
              accent="emerald"
            />
            <StatCard
              icon={IndianRupee}
              label="Revenue (all time)"
              value={formatInr(overview.revenue_all_time_inr)}
              accent="emerald"
            />
            <StatCard
              icon={TrendingUp}
              label="Revenue (this month)"
              value={formatInr(overview.revenue_mtd_inr)}
              accent="blue"
            />
            <StatCard icon={IndianRupee} label="Est. MRR" value={formatInr(overview.mrr_inr)} accent="violet" />
            <StatCard
              icon={MessageCircle}
              label="WhatsApp connected"
              value={overview.whatsapp_connected}
              accent="emerald"
            />
          </div>

          {analytics && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card title="New signups (30 days)">
                <BarChart data={analytics.signups} color="violet" />
              </Card>
              <Card title="Revenue (30 days)">
                <BarChart
                  data={analytics.revenue}
                  color="emerald"
                  formatValue={(v) => formatInr(v)}
                />
              </Card>
              <Card title="Users by billing status">
                <DonutChart segments={statusSegments} />
              </Card>
              <Card title="Active subscriptions by plan">
                <DonutChart segments={planSegments} />
              </Card>
            </div>
          )}

          <Card title="Recent transactions">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">User</th>
                    <th className="py-2 pr-4">Plan</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(overview.recent_transactions ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No transactions recorded yet. Payments appear after checkout or Razorpay webhooks.
                      </td>
                    </tr>
                  ) : (
                    overview.recent_transactions.map((t) => (
                      <tr key={t.id} className="border-b border-slate-100">
                        <td className="py-3 pr-4 text-slate-600">{formatDateTime(t.created_at)}</td>
                        <td className="py-3 pr-4">
                          <p className="font-medium text-slate-900">{t.user_name}</p>
                          <p className="text-xs text-slate-500">{t.user_email}</p>
                        </td>
                        <td className="py-3 pr-4">
                          <PlanBadge plan={t.plan} />
                          <p className="mt-0.5 text-[10px] text-slate-500">
                            {formatBillingEventType(t.event_type)}
                          </p>
                        </td>
                        <td className="py-3 pr-4 font-medium text-slate-900">
                          {formatInr(t.amount_inr)}
                        </td>
                        <td className="py-3">
                          <StatusPill status={t.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setTab('transactions')}>
                View all transactions
              </Button>
              {(overview.pending_payment_submissions ?? 0) > 0 && (
                <Button onClick={() => setTab('payments')}>
                  Review {overview.pending_payment_submissions} pending UPI
                </Button>
              )}
            </div>
          </Card>
        </>
      )}

      {tab === 'payments' && (
        <AdminPaymentReviews onOverviewRefresh={loadOverview} />
      )}

      {tab === 'users' && (
        <Card title="All users & plans">
          <form onSubmit={onSearchUsers} className="mb-4 flex flex-wrap gap-2">
            <div className="min-w-[180px] flex-1">
              <Input
                label="Search"
                placeholder="Name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-40">
              <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
              <select
                value={userStatus}
                onChange={(e) => setUserStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              >
                <option value="">All</option>
                <option value="trial">Trial</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending_verification">Pending UPI</option>
              </select>
            </div>
            <div className="w-40">
              <label className="mb-1 block text-xs font-medium text-slate-600">Plan</label>
              <select
                value={userPlan}
                onChange={(e) => setUserPlan(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              >
                <option value="">All</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="none">No plan</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" variant="secondary">
                <Search size={16} className="mr-1 inline" />
                Filter
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSearch('');
                  setUserStatus('');
                  setUserPlan('');
                  loadUsers(1, '', '', '');
                }}
              >
                Reset
              </Button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Business</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Plan</th>
                  <th className="py-2 pr-4">Access</th>
                  <th className="py-2 pr-4">Period / trial</th>
                  <th className="py-2 pr-4">WhatsApp</th>
                  <th className="py-2 pr-4">Joined</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {users.items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.items.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                        {u.is_super_admin && (
                          <span className="mt-1 inline-block rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-800">
                            Super admin
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{u.business_category || '—'}</td>
                      <td className="py-3 pr-4">
                        <StatusPill status={u.billing?.status ?? u.subscription_status} />
                      </td>
                      <td className="py-3 pr-4">
                        <PlanBadge plan={u.subscription_plan} />
                      </td>
                      <td className="py-3 pr-4">
                        {u.billing?.has_access ? (
                          <span className="text-xs font-medium text-emerald-700">Has access</span>
                        ) : (
                          <span className="text-xs font-medium text-red-600">No access</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-xs text-slate-600">
                        {u.billing?.status === 'trial'
                          ? `Trial → ${formatDate(u.trial_ends_at)}`
                          : u.current_period_end
                            ? `Until ${formatDate(u.current_period_end)}`
                            : '—'}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {u.whatsapp_connected ? u.whatsapp_display || 'Connected' : '—'}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{formatDate(u.created_at)}</td>
                      <td className="py-3 text-right">
                        <Button variant="secondary" onClick={() => openUser(u.id)} loading={detailLoading}>
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {users.total > users.per_page && (
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>
                Page {users.page} · {users.total} users
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  disabled={users.page <= 1}
                  onClick={() => loadUsers(users.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  disabled={users.page * users.per_page >= users.total}
                  onClick={() => loadUsers(users.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {tab === 'transactions' && (
        <Card title="Platform transactions">
          <form onSubmit={onSearchTx} className="mb-4 flex flex-wrap gap-2">
            <div className="min-w-[200px] flex-1">
              <Input
                label="Search"
                placeholder="User, payment ID, subscription ID"
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="secondary">
                <Search size={16} className="mr-1 inline" />
                Search
              </Button>
            </div>
          </form>

          <p className="mb-4 text-sm text-slate-600">
            Filtered total:{' '}
            <span className="font-semibold text-slate-900">
              {formatInr(transactions.total_amount_inr)}
            </span>{' '}
            · {transactions.total} records
          </p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Event</th>
                  <th className="py-2 pr-4">Plan</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Payment ID</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No transactions yet
                    </td>
                  </tr>
                ) : (
                  transactions.items.map((t) => (
                    <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                      <td className="py-3 pr-4 text-slate-600">{formatDateTime(t.created_at)}</td>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-900">{t.user_name}</p>
                        <p className="text-xs text-slate-500">{t.user_email}</p>
                      </td>
                      <td className="py-3 pr-4 text-xs text-slate-600">
                        {formatBillingEventType(t.event_type)}
                      </td>
                      <td className="py-3 pr-4">
                        <PlanBadge plan={t.plan} />
                      </td>
                      <td className="py-3 pr-4 font-medium text-slate-900">
                        {formatInr(t.amount_inr)}
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-slate-500">
                        {t.razorpay_payment_id || '—'}
                      </td>
                      <td className="py-3">
                        <StatusPill status={t.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {transactions.total > transactions.per_page && (
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>
                Page {transactions.page} · {transactions.total} transactions
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  disabled={transactions.page <= 1}
                  onClick={() => loadTransactions(transactions.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  disabled={transactions.page * transactions.per_page >= transactions.total}
                  onClick={() => loadTransactions(transactions.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{selected.name}</h2>
                <p className="text-sm text-slate-500">{selected.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <dl className="space-y-2 text-sm">
                <p className="font-semibold text-slate-900">Billing</p>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Status</dt>
                  <dd>
                    <StatusPill status={selected.billing?.status ?? selected.subscription_status} />
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Plan</dt>
                  <dd>
                    <PlanBadge plan={selected.subscription_plan} />
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Access</dt>
                  <dd>{selected.billing?.has_access ? 'Yes' : 'No'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Trial ends</dt>
                  <dd>{formatDate(selected.trial_ends_at)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Period ends</dt>
                  <dd>{formatDate(selected.current_period_end)}</dd>
                </div>
                {selected.billing?.cancel_at_period_end ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Cancel scheduled</dt>
                    <dd className="text-amber-700">At period end</dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Razorpay customer</dt>
                  <dd className="font-mono text-xs">{selected.razorpay_customer_id || '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Razorpay subscription</dt>
                  <dd className="font-mono text-xs">{selected.razorpay_subscription_id || '—'}</dd>
                </div>
              </dl>

              <dl className="space-y-2 text-sm">
                <p className="font-semibold text-slate-900">Usage & channels</p>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Business</dt>
                  <dd>{selected.business_category || '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Use cases</dt>
                  <dd className="text-right">{selected.use_cases || '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">WhatsApp</dt>
                  <dd>{selected.whatsapp_connected ? selected.whatsapp_display || 'Connected' : 'Not connected'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Instagram</dt>
                  <dd>
                    {selected.instagram_connected
                      ? selected.instagram_username || 'Connected'
                      : 'Not connected'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Contacts</dt>
                  <dd>{selected.counts?.contacts ?? 0}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Workflows</dt>
                  <dd>{selected.counts?.workflows ?? 0}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Messages</dt>
                  <dd>{selected.counts?.messages ?? 0}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Leads</dt>
                  <dd>{selected.counts?.leads ?? 0}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Joined</dt>
                  <dd>{formatDate(selected.created_at)}</dd>
                </div>
              </dl>
            </div>

            {(selected.transactions ?? []).length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="mb-2 text-sm font-semibold text-slate-900">Payment history</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-500">
                        <th className="py-1 pr-2">Date</th>
                        <th className="py-1 pr-2">Type</th>
                        <th className="py-1 pr-2">Plan</th>
                        <th className="py-1 pr-2">Amount</th>
                        <th className="py-1">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.transactions.map((t) => (
                        <tr key={t.id} className="border-t border-slate-50">
                          <td className="py-2 pr-2">{formatDate(t.created_at)}</td>
                          <td className="py-2 pr-2 text-slate-600">
                            {formatBillingEventType(t.event_type)}
                          </td>
                          <td className="py-2 pr-2">{t.plan || '—'}</td>
                          <td className="py-2 pr-2">{formatInr(t.amount_inr)}</td>
                          <td className="py-2">
                            <StatusPill status={t.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <AdminUserPendingPayment
              user={selected}
              loading={actionLoading}
              onUpdated={async () => {
                await openUser(selected.id);
                loadUsers(users.page);
                loadOverview();
              }}
            />

            <AdminSubscriptionControls
              user={selected}
              loading={actionLoading}
              onApply={(payload) => runSubscriptionAction(payload)}
            />

            {!selected.is_super_admin && (
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                <p className="text-sm font-medium text-slate-900">Quick access overrides</p>
                <Button
                  className="w-full"
                  loading={actionLoading}
                  onClick={() => runAccessAction({ grant_full_access: true })}
                >
                  Grant full platform access
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  loading={actionLoading}
                  onClick={() => runAccessAction({ extend_trial_days: 30 })}
                >
                  Extend trial 30 days
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  loading={actionLoading}
                  onClick={() => runAccessAction({ subscription_status: 'cancelled' })}
                >
                  Cancel access
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
