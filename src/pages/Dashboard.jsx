import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Workflow, Inbox, Users, Wifi, Bot } from 'lucide-react';
import Card from '../components/ui/Card';
import api from '../services/api';

const statConfig = [
  { key: 'total_messages', label: 'Total Messages', icon: MessageSquare, color: 'text-blue-600 bg-blue-50' },
  { key: 'active_workflows', label: 'Active Workflows', icon: Workflow, color: 'text-purple-600 bg-purple-50' },
  { key: 'inbox_conversations', label: 'Inbox Conversations', icon: Inbox, color: 'text-amber-600 bg-amber-50' },
  { key: 'contacts_count', label: 'Contacts', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    api
      .get('/settings/business-profile')
      .then((r) => {
        if (!r.data?.configured) {
          navigate('/workflows', { replace: true });
        }
      })
      .catch(() => {});
    api.get('/dashboard/stats').then((r) => setStats(r.data));
    api.get('/dashboard/activity').then((r) => setActivities(r.data.activities || []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your WhatsApp automation platform</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statConfig.map(({ key, label, icon: Icon, color }) => (
          <Card key={key} className="!p-4">
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.[key] ?? '—'}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="WhatsApp Connection">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${stats?.whatsapp_connected ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <Wifi size={20} />
            </div>
            <div>
              <p className="font-medium">{stats?.whatsapp_connected ? 'Connected' : 'Not connected'}</p>
              <p className="text-sm text-slate-500">{stats?.whatsapp_display || 'Configure in Settings → WhatsApp'}</p>
            </div>
          </div>
        </Card>

        <Card title="AI Usage">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-violet-50 p-2 text-violet-600">
              <Bot size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.ai_usage ?? 0}</p>
              <p className="text-sm text-slate-500">Workflow executions with AI nodes</p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Recent Activity">
        {activities.length === 0 ? (
          <p className="text-sm text-slate-500">No activity yet. Connect WhatsApp and publish a workflow to get started.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {activities.map((a) => (
              <li key={a.id} className="flex justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-800">{a.title}</p>
                  {a.description && <p className="text-slate-500 truncate max-w-md">{a.description}</p>}
                </div>
                <span className="text-xs text-slate-400">{new Date(a.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
