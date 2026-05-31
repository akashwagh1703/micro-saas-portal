import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare, Bot, Inbox, Users, Wifi, UserPlus } from 'lucide-react';
import Card from '../components/ui/Card';
import SetupChecklist from '../components/onboarding/SetupChecklist';
import TestBotCard from '../components/onboarding/TestBotCard';
import ChannelAnalytics from '../components/dashboard/ChannelAnalytics';
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
  const [integrationHealth, setIntegrationHealth] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchSetupProgress(api).then(setProgress);
    api.get('/dashboard/activity').then((r) => setActivities(r.data.activities || []));
    api.get('/dashboard/integration-health').then((r) => setIntegrationHealth(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!progress?.complete) return;
    api.get('/dashboard/analytics', { params: { days: 7 } })
      .then((r) => setAnalytics(r.data))
      .catch(() => {});
  }, [progress?.complete]);

  const steps = progress ? buildSetupSteps(progress) : [];
  const stats = progress?.stats;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Home</h1>
        <p className="text-sm text-slate-500">WhatsApp and Instagram auto-replies — one dashboard</p>
      </div>

      {progress && (
        <SetupChecklist steps={steps} userName={user?.name} />
      )}

      {progress && (progress.hasLive || progress.channelConnected) && (
        <TestBotCard
          whatsappDisplay={progress.whatsappDisplay}
          instagramUsername={progress.instagramUsername}
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
                <div className="flex-1">
                  <p className="font-medium">WhatsApp {stats?.whatsapp_connected ? 'connected' : 'not connected'}</p>
                  <p className="text-sm text-slate-500">
                    {stats?.whatsapp_display || 'Connect in Settings → WhatsApp'}
                  </p>
                  {stats?.whatsapp_connected && (
                    <p className="mt-1 text-xs text-slate-400">
                      {stats.whatsapp_messages ?? 0} messages · {stats.whatsapp_conversations ?? 0} chats · {stats.whatsapp_leads ?? 0} leads
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className={`rounded-full p-2 ${stats?.instagram_connected ? 'bg-pink-50 text-pink-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Wifi size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Instagram {stats?.instagram_connected ? 'connected' : 'not connected'}</p>
                  <p className="text-sm text-slate-500">
                    {stats?.instagram_username
                      ? `@${stats.instagram_username.replace(/^@/, '')}`
                      : 'Connect in Settings → Instagram'}
                  </p>
                  {stats?.instagram_connected && (
                    <p className="mt-1 text-xs text-slate-400">
                      {stats.instagram_messages ?? 0} messages · {stats.instagram_conversations ?? 0} chats · {stats.instagram_leads ?? 0} leads
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <ChannelAnalytics analytics={analytics} />

          {integrationHealth && !integrationHealth.healthy && (
            <Card title="Delivery health">
              <p className="text-sm text-amber-800">
                {integrationHealth.failed_outbound_7d} failed outbound message
                {integrationHealth.failed_outbound_7d === 1 ? '' : 's'} in the last 7 days
                {integrationHealth.instagram_failed_7d > 0 && integrationHealth.whatsapp_failed_7d > 0
                  ? ` (WhatsApp: ${integrationHealth.whatsapp_failed_7d}, Instagram: ${integrationHealth.instagram_failed_7d})`
                  : integrationHealth.instagram_failed_7d > 0
                    ? ` (Instagram: ${integrationHealth.instagram_failed_7d})`
                    : integrationHealth.whatsapp_failed_7d > 0
                      ? ` (WhatsApp: ${integrationHealth.whatsapp_failed_7d})`
                      : ''}
                .
              </p>
              {integrationHealth.recent_errors?.length > 0 && (
                <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-sm">
                  {integrationHealth.recent_errors.map((err) => (
                    <li key={err.id}>
                      <p className="font-medium text-slate-800">{err.title}</p>
                      {err.description && <p className="text-slate-500">{err.description}</p>}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-slate-500">
                Instagram replies only work within 24 hours of the customer&apos;s last DM. Check Settings if tokens expired.
              </p>
            </Card>
          )}
        </>
      )}

      {!progress?.complete && progress && (
        <Card title="What happens next?">
          <p className="text-sm leading-relaxed text-slate-600">
            Once you finish the steps above, customers who message you on WhatsApp or Instagram will get
            instant replies — appointments, FAQs, lead capture, and more. Nothing sends until you
            click <strong>Go live</strong>. You can turn it off anytime.
          </p>
        </Card>
      )}

      {progress?.complete && (
        <Card title="Recent activity">
          {activities.length === 0 ? (
            <p className="text-sm text-slate-500">No activity yet. Send a test message on WhatsApp or Instagram.</p>
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
