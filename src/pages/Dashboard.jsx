import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare, Bot, Inbox, Users, Wifi, UserPlus } from 'lucide-react';
import Card from '../components/ui/Card';
import SetupChecklist from '../components/onboarding/SetupChecklist';
import TestBotCard from '../components/onboarding/TestBotCard';
import api from '../services/api';
import { fetchSetupProgress, buildSetupSteps } from '../utils/setupProgress';

const statConfig = [
  { key: 'total_messages', label: 'Messages handled', icon: MessageSquare, color: 'text-blue-600 bg-blue-50' },
  { key: 'active_workflows', label: 'Auto-replies live', icon: Bot, color: 'text-purple-600 bg-purple-50' },
  { key: 'inbox_conversations', label: 'Customer chats', icon: Inbox, color: 'text-amber-600 bg-amber-50' },
  { key: 'contacts_count', label: 'Contacts', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
  { key: 'leads_count', label: 'Leads captured', icon: UserPlus, color: 'text-rose-600 bg-rose-50' },
];

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user);
  const [progress, setProgress] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchSetupProgress(api).then(setProgress);
    api.get('/dashboard/activity').then((r) => setActivities(r.data.activities || []));
  }, []);

  const steps = progress ? buildSetupSteps(progress) : [];
  const stats = progress?.stats;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Home</h1>
        <p className="text-sm text-slate-500">Your WhatsApp auto-reply control center</p>
      </div>

      {progress && (
        <SetupChecklist steps={steps} userName={user?.name} />
      )}

      {progress && (progress.hasLive || progress.whatsappConnected) && (
        <TestBotCard
          whatsappDisplay={progress.whatsappDisplay}
          workflows={progress.workflows}
        />
      )}

      {progress?.complete && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
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

          <Card title="Channel status">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2 ${stats?.whatsapp_connected ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Wifi size={20} />
                </div>
                <div>
                  <p className="font-medium">WhatsApp {stats?.whatsapp_connected ? 'connected' : 'not connected'}</p>
                  <p className="text-sm text-slate-500">
                    {stats?.whatsapp_display || 'Connect in Settings → WhatsApp'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className={`rounded-full p-2 ${stats?.instagram_connected ? 'bg-pink-50 text-pink-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Wifi size={20} />
                </div>
                <div>
                  <p className="font-medium">Instagram {stats?.instagram_connected ? 'connected' : 'not connected'}</p>
                  <p className="text-sm text-slate-500">
                    {stats?.instagram_username
                      ? `@${stats.instagram_username.replace(/^@/, '')}`
                      : 'Connect in Settings → Instagram'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {!progress?.complete && progress && (
        <Card title="What happens next?">
          <p className="text-sm leading-relaxed text-slate-600">
            Once you finish the steps above, customers who message your WhatsApp number will get
            instant replies — appointments, FAQs, lead capture, and more. Nothing sends until you
            click <strong>Go live</strong>. You can turn it off anytime.
          </p>
        </Card>
      )}

      {progress?.complete && (
        <Card title="Recent activity">
          {activities.length === 0 ? (
            <p className="text-sm text-slate-500">No activity yet. Send a test message to your WhatsApp number.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {activities.map((a) => (
                <li key={a.id} className="flex justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{a.title}</p>
                    {a.description && <p className="max-w-md truncate text-slate-500">{a.description}</p>}
                  </div>
                  <span className="text-xs text-slate-400">{new Date(a.created_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
