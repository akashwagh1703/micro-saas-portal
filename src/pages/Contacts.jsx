import { useEffect, useState } from 'react';
import { Search, X, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';
import api from '../services/api';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchContacts = () => {
    setLoading(true);
    api.get('/contacts', { params: { search } })
      .then((r) => setContacts(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(fetchContacts, 300);
    return () => clearTimeout(t);
  }, [search]);

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="text-sm text-slate-500">People who have messaged you on WhatsApp</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No contacts yet"
            description="When customers message your WhatsApp number, they'll show up here automatically."
            actionLabel="Set up auto-replies"
            actionHref="/workflows"
            hint="Connect WhatsApp and go live to start receiving messages."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Phone</th>
                  <th className="pb-3 font-medium">Tags</th>
                  <th className="pb-3 font-medium">Last Message</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-medium">{c.name || '—'}</td>
                    <td className="py-3">{c.phone}</td>
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
              <h2 className="text-lg font-bold">{detail?.contact?.name || selected.phone}</h2>
              <button onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">{detail?.contact?.phone}</p>
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
