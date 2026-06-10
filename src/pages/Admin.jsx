import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, UserPlus, CreditCard, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatusPill({ status }) {
  const styles = {
    trial: 'bg-amber-100 text-amber-800',
    active: 'bg-emerald-100 text-emerald-800',
    expired: 'bg-red-100 text-red-800',
    cancelled: 'bg-slate-100 text-slate-700',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || styles.expired}`}>
      {status || 'unknown'}
    </span>
  );
}

export default function Admin() {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState({ items: [], total: 0, page: 1, per_page: 20 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadOverview = useCallback(async () => {
    const { data } = await api.get('/admin/overview');
    setOverview(data);
  }, []);

  const loadUsers = useCallback(async (page = 1, q = search) => {
    const { data } = await api.get('/admin/users', { params: { page, search: q || undefined } });
    setUsers(data);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadOverview(), loadUsers(1)]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load admin dashboard');
    } finally {
      setLoading(false);
    }
  }, [loadOverview, loadUsers]);

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

  const onSearch = (e) => {
    e.preventDefault();
    loadUsers(1, search);
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading admin dashboard…</p>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield size={22} className="text-violet-600" />
            <h1 className="text-2xl font-bold text-slate-900">Platform admin</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Manage all registered operators — billing, channels, and usage.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          My operator dashboard →
        </Link>
      </div>

      {overview && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="!p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Users size={16} />
              <span className="text-xs font-medium uppercase tracking-wide">Total users</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{overview.total_users}</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <UserPlus size={16} />
              <span className="text-xs font-medium uppercase tracking-wide">New this week</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{overview.new_this_week}</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <CreditCard size={16} />
              <span className="text-xs font-medium uppercase tracking-wide">Active plans</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{overview.active_subscriptions}</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">On trial</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{overview.on_trial}</p>
            <p className="mt-1 text-xs text-slate-500">
              {overview.expired_or_cancelled} expired / cancelled
            </p>
          </Card>
        </div>
      )}

      <Card title="All users">
        <form onSubmit={onSearch} className="mb-4 flex flex-wrap gap-2">
          <div className="min-w-[200px] flex-1">
            <Input
              label="Search"
              placeholder="Name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="secondary">
              <Search size={16} className="mr-1 inline" />
              Search
            </Button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">Business</th>
                <th className="py-2 pr-4">Billing</th>
                <th className="py-2 pr-4">WhatsApp</th>
                <th className="py-2 pr-4">Joined</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {users.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
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
                      <StatusPill status={u.subscription_status} />
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {u.whatsapp_connected ? u.whatsapp_display || 'Connected' : '—'}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{formatDate(u.created_at)}</td>
                    <td className="py-3 text-right">
                      <Button variant="secondary" onClick={() => openUser(u.id)} loading={detailLoading}>
                        Manage
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

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
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

            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Status</dt>
                <dd><StatusPill status={selected.subscription_status} /></dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Trial ends</dt>
                <dd>{formatDate(selected.trial_ends_at)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Business</dt>
                <dd>{selected.business_category || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">WhatsApp</dt>
                <dd>{selected.whatsapp_connected ? 'Connected' : 'Not connected'}</dd>
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
            </dl>

            {!selected.is_super_admin && (
              <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
                <p className="text-sm font-medium text-slate-900">Access controls</p>
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
