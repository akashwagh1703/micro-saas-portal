import { useEffect, useState } from 'react';
import { Search, X, UserPlus, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import api from '../services/api';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  won: 'Won',
  lost: 'Lost',
};

function statusBadgeClass(status) {
  const map = {
    new: 'bg-blue-50 text-blue-700',
    contacted: 'bg-amber-50 text-amber-700',
    qualified: 'bg-purple-50 text-purple-700',
    won: 'bg-emerald-50 text-emerald-700',
    lost: 'bg-slate-100 text-slate-600',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
}

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchLeads = () => {
    setLoading(true);
    api.get('/leads', { params: { search, status: statusFilter || undefined } })
      .then((r) => setLeads(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/leads/stats').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchLeads, 300);
    return () => clearTimeout(t);
  }, [search, statusFilter]);

  const openDetail = async (lead) => {
    setSelected(lead);
    const { data } = await api.get(`/leads/${lead.id}`);
    setDetail(data.lead);
  };

  const updateStatus = async (status) => {
    if (!selected) return;
    setSaving(true);
    try {
      const { data } = await api.patch(`/leads/${selected.id}`, { status });
      toast.success('Lead updated');
      setDetail(data.lead);
      setSelected(data.lead);
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = async (notes) => {
    if (!selected) return;
    setSaving(true);
    try {
      const { data } = await api.patch(`/leads/${selected.id}`, { notes });
      toast.success('Notes saved');
      setDetail(data.lead);
      setSelected(data.lead);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = async () => {
    try {
      const response = await api.get('/leads/export', {
        params: { status: statusFilter || undefined },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    }
  };

  const collectedEntries = detail?.collected && typeof detail.collected === 'object'
    ? Object.entries(detail.collected)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-sm text-slate-500">Leads captured from WhatsApp auto-replies</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={exportCsv}>
            <Download size={16} className="mr-1 inline" />
            Export CSV
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid gap-3 sm:grid-cols-4">
          <Card className="!p-4">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-slate-500">Total leads</p>
          </Card>
          <Card className="!p-4">
            <p className="text-2xl font-bold">{stats.this_week}</p>
            <p className="text-xs text-slate-500">This week</p>
          </Card>
          <Card className="!p-4">
            <p className="text-2xl font-bold">{stats.new}</p>
            <p className="text-xs text-slate-500">New</p>
          </Card>
          <Card className="!p-4">
            <p className="text-2xl font-bold">{stats.qualified}</p>
            <p className="text-xs text-slate-500">Qualified</p>
          </Card>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <Card>
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : leads.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="No leads yet"
            description="When your auto-replies include a Save Lead step, captured leads will appear here."
            actionLabel="Set up lead capture"
            actionHref="/workflows"
            hint="Use the Lead Capture template or add a Save Lead step in the workflow editor."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Phone</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Channel</th>
                  <th className="pb-3 font-medium">Captured</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-medium">{lead.name || '—'}</td>
                    <td className="py-3">{lead.phone || '—'}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(lead.status)}`}>
                        {STATUS_LABELS[lead.status] || lead.status}
                      </span>
                    </td>
                    <td className="py-3 capitalize text-slate-500">{lead.channel}</td>
                    <td className="py-3 text-slate-500">
                      {lead.created_at ? new Date(lead.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="py-3">
                      <Button variant="secondary" onClick={() => openDetail(lead)}>View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && detail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setSelected(null)}>
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{detail.name || detail.phone || 'Lead'}</h2>
              <button type="button" onClick={() => setSelected(null)}><X size={20} /></button>
            </div>

            <div className="mb-4 space-y-2 text-sm">
              {detail.phone && <p><span className="text-slate-500">Phone:</span> {detail.phone}</p>}
              {detail.source_message && (
                <p><span className="text-slate-500">First message:</span> {detail.source_message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">Status</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={detail.status}
                disabled={saving}
                onChange={(e) => updateStatus(e.target.value)}
              >
                {STATUS_OPTIONS.filter((o) => o.value).map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {collectedEntries.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium">Collected answers</p>
                <ul className="space-y-1 rounded-lg bg-slate-50 p-3 text-sm">
                  {collectedEntries.map(([key, value]) => (
                    <li key={key}><span className="text-slate-500">{key}:</span> {String(value)}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-4">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                rows={3}
                defaultValue={detail.notes || ''}
                onBlur={(e) => {
                  if (e.target.value !== (detail.notes || '')) {
                    saveNotes(e.target.value);
                  }
                }}
              />
            </div>

            <p className="text-xs text-slate-400">
              Captured {detail.created_at ? new Date(detail.created_at).toLocaleString() : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
