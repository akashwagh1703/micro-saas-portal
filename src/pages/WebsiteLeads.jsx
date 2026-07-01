import { useEffect, useState } from 'react';
import { Search, Calendar, Building2, Mail, Phone, Star, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Pagination from '../components/ui/Pagination';
import api from '../services/api';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'demo_confirmed', label: 'Demo Confirmed' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
];

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  demo_confirmed: 'Demo Confirmed',
  converted: 'Converted',
  lost: 'Lost',
};

function statusBadgeClass(status) {
  const map = {
    new: 'bg-blue-50 text-blue-700',
    contacted: 'bg-amber-50 text-amber-700',
    demo_confirmed: 'bg-purple-50 text-purple-700',
    converted: 'bg-emerald-50 text-emerald-700',
    lost: 'bg-slate-100 text-slate-600',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
}

function getScoreColor(score) {
  if (score >= 70) return 'text-emerald-600 bg-emerald-50';
  if (score >= 40) return 'text-amber-600 bg-amber-50';
  return 'text-slate-600 bg-slate-50';
}

const PAGE_SIZE = 15;

export default function WebsiteLeads() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchLeads = () => {
    setLoading(true);
    api.get('/website/leads', { params: { status: statusFilter || undefined, page } })
      .then((r) => setLeads(r.data.data || []))
      .catch((err) => {
        console.error('Failed to fetch website leads:', err);
        toast.error('Failed to fetch leads');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/website/leads/stats')
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchLeads, 300);
    return () => clearTimeout(t);
  }, [statusFilter, page]);

  const openDetail = async (lead) => {
    setSelected(lead);
    try {
      const { data } = await api.get(`/website/leads/${lead.id}`);
      setDetail(data);
    } catch (err) {
      toast.error('Failed to fetch lead details');
    }
  };

  const updateStatus = async (status) => {
    if (!selected) return;
    setSaving(true);
    try {
      const { data } = await api.patch(`/website/leads/${selected.id}`, { status });
      toast.success('Lead updated');
      setDetail(data);
      setSelected(data);
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
      const { data } = await api.patch(`/website/leads/${selected.id}`, { notes });
      toast.success('Notes saved');
      setDetail(data);
      setSelected(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = async () => {
    try {
      const response = await api.get('/website/leads/export', {
        params: { status: statusFilter || undefined },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'website-leads.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    }
  };

  const pagedLeads = leads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Marketing"
        title="Website Demo Leads"
        description="Leads captured from the marketing website"
        action={
          <Button variant="secondary" onClick={exportCsv}>
            <Download size={16} className="mr-1 inline" />
            Export CSV
          </Button>
        }
      />

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Leads" value={stats.total} accent="emerald" />
          <StatCard label="This Week" value={stats.thisWeek} accent="blue" />
          <StatCard label="Demo Confirmed" value={stats.demoConfirmed} accent="violet" />
          <StatCard label="Conversion Rate" value={`${stats.conversionRate}%`} accent="amber" />
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
            icon={Building2}
            title="No website leads yet"
            description="Demo requests from the marketing website will appear here."
            actionLabel="Visit Website"
            actionHref="https://autowave.playltp.in"
            hint="Leads are captured when users submit the demo request form on the website."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Contact</th>
                  <th className="pb-3 font-medium">Business</th>
                  <th className="pb-3 font-medium">Score</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pagedLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-medium">{lead.name || '—'}</td>
                    <td className="py-3">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-xs">
                          <Mail size={12} /> {lead.email}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Phone size={12} /> {lead.phone}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{lead.businessType}</span>
                        {lead.companyName && (
                          <span className="text-xs text-slate-500">{lead.companyName}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getScoreColor(lead.score)}`}>
                        <Star size={12} className="inline mr-1" />
                        {lead.score || 0}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(lead.status)}`}>
                        {STATUS_LABELS[lead.status] || lead.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3">
                      <Button variant="secondary" onClick={() => openDetail(lead)}>View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              totalItems={leads.length}
              onPageChange={setPage}
              itemLabel="lead"
            />
          </div>
        )}
      </Card>

      {selected && detail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setSelected(null)}>
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{detail.name || detail.email || 'Lead'}</h2>
              <button type="button" onClick={() => setSelected(null)}><X size={20} /></button>
            </div>

            <div className="mb-4 space-y-2 text-sm">
              {detail.email && <p><span className="text-slate-500">Email:</span> {detail.email}</p>}
              {detail.phone && <p><span className="text-slate-500">Phone:</span> {detail.phone}</p>}
              {detail.businessType && <p><span className="text-slate-500">Business Type:</span> {detail.businessType}</p>}
              {detail.companyName && <p><span className="text-slate-500">Company:</span> {detail.companyName}</p>}
              {detail.monthlyMessages && <p><span className="text-slate-500">Monthly Messages:</span> {detail.monthlyMessages}</p>}
              {detail.challenge && <p><span className="text-slate-500">Challenge:</span> {detail.challenge}</p>}
              {detail.source && <p><span className="text-slate-500">Source:</span> {detail.source}</p>}
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
              Captured {detail.createdAt ? new Date(detail.createdAt).toLocaleString() : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
