import { useEffect, useState } from 'react';
import { Search, X, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import api from '../services/api';
import {
  channelBadgeClass,
  channelBadgeLabel,
  contactPrimaryLabel,
  contactReachLabel,
} from '../utils/contactDisplay';

const CHANNEL_OPTIONS = [
  { value: '', label: 'All channels' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
];

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchContacts = () => {
    setLoading(true);
    api.get('/contacts', { params: { search, channel: channelFilter || undefined } })
      .then((r) => setContacts(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(fetchContacts, 300);
    return () => clearTimeout(t);
  }, [search, channelFilter]);

  const openDetail = async (contact) => {
    setSelected(contact);
    const { data } = await api.get(`/contacts/${contact.id}`);
    setDetail(data);
  };

  const addTag = async (tag) => {
    if (!selected || !tag.trim()) return;
    const tags = [...(selected.tags || []), tag.trim()];
    await api.put(`/contacts/${selected.id}`, { tags });
    toast.success('Tag added');
    fetchContacts();
    openDetail({ ...selected, tags });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Audience"
        title="Contacts"
        description="People who have messaged you on WhatsApp or Instagram"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
            >
              {CHANNEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                className="rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        }
      />

      <Card>
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No contacts yet"
            description="When customers message you on WhatsApp or Instagram, they'll show up here automatically."
            actionLabel="Set up auto-replies"
            actionHref="/workflows"
            hint="Connect a channel and go live to start receiving messages."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Channel</th>
                  <th className="pb-3 font-medium">Phone / Username</th>
                  <th className="pb-3 font-medium">Tags</th>
                  <th className="pb-3 font-medium">Last Message</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-medium">{contactPrimaryLabel(c)}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${channelBadgeClass(c.channel)}`}>
                        {channelBadgeLabel(c.channel)}
                      </span>
                    </td>
                    <td className="py-3">{contactReachLabel(c)}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {(c.tags || []).map((t) => (
                          <span key={t} className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 text-slate-500">
                      {c.last_message_at ? new Date(c.last_message_at).toLocaleString() : '—'}
                    </td>
                    <td className="py-3">
                      <Button variant="secondary" onClick={() => openDetail(c)}>View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setSelected(null)}>
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{contactPrimaryLabel(detail?.contact || selected)}</h2>
              <button type="button" onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <div className="mb-4 space-y-1 text-sm">
              <p>
                <span className="text-slate-500">Channel:</span>{' '}
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${channelBadgeClass(detail?.contact?.channel || selected.channel)}`}>
                  {channelBadgeLabel(detail?.contact?.channel || selected.channel)}
                </span>
              </p>
              <p><span className="text-slate-500">Reach:</span> {contactReachLabel(detail?.contact || selected)}</p>
            </div>
            {detail?.contact?.notes && <p className="text-sm mb-4">{detail.contact.notes}</p>}
            <h3 className="text-sm font-semibold mb-2">Recent Messages</h3>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {(detail?.recent_messages || []).map((m) => (
                <div key={m.id} className={`rounded-lg p-2 text-sm ${m.direction === 'incoming' ? 'bg-slate-100' : 'bg-emerald-50'}`}>
                  {m.content}
                </div>
              ))}
            </div>
            <Input label="Add tag" placeholder="Press Enter" onKeyDown={(e) => {
              if (e.key === 'Enter') { addTag(e.target.value); e.target.value = ''; }
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
