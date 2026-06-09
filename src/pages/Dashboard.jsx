import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  MessageSquare,
  Bot,
  Inbox,
  Users,
  Wifi,
  UserPlus,
  Briefcase,
  FileText,
  Target,
  ArrowRight,
} from 'lucide-react';
import Card from '../components/ui/Card';
import SetupChecklist from '../components/onboarding/SetupChecklist';
import TestBotCard from '../components/onboarding/TestBotCard';
import BusinessWizard from '../components/BusinessWizard';
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
  const { refreshBusinessProfile } = useOutletContext() ?? {};
  const [progress, setProgress] = useState(null);
  const [activities, setActivities] = useState([]);
  const [integrationHealth, setIntegrationHealth] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [careerStats, setCareerStats] = useState(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    fetchSetupProgress(api).then((p) => {
      setProgress(p);
      if (!p.businessConfigured) setWizardOpen(true);
      if (p.isCareerAi && p.businessConfigured) {
        api.get('/career/analytics').then((r) => setCareerStats(r.data)).catch(() => {});
      }
    });
    api.get('/dashboard/activity').then((r) => setActivities(r.data.activities || []));
    api.get('/dashboard/integration-health').then((r) => setIntegrationHealth(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!progress?.complete || progress.isCareerAi) return;
    api.get('/dashboard/analytics', { params: { days: 7 } })
      .then((r) => setAnalytics(r.data))
      .catch(() => {});
  }, [progress?.complete, progress?.isCareerAi]);

  const refresh = () => {
    fetchSetupProgress(api).then((p) => {
      setProgress(p);
      if (p.isCareerAi && p.businessConfigured) {
        api.get('/career/analytics').then((r) => setCareerStats(r.data)).catch(() => {});
      }
    });
  };

  const handleWizardCreated = () => {
    setWizardOpen(false);
    refresh();
    refreshBusinessProfile?.();
  };

  const steps = progress ? buildSetupSteps(progress) : [];
  const stats = progress?.stats;
  const isCareerAi = progress?.isCareerAi;

  if (isCareerAi) {
    const careerCards = careerStats
      ? [
          { label: 'Job seekers', value: careerStats.profiles, icon: Users },
          { label: 'Complete profiles', value: careerStats.complete_profiles, icon: Briefcase },
          { label: 'Active jobs', value: careerStats.jobs, icon: Target },
          { label: 'Applications', value: careerStats.applications, icon: FileText },
        ]
      : [];

    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white shadow-lg shadow-emerald-600/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">CareerAI</p>
          <h1 className="mt-1 text-2xl font-bold">
            {user?.name ? `Hi ${user.name.split(' ')[0]}` : 'Welcome'}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-emerald-50/95">
            Job seekers message your WhatsApp → resume parsed → 70%+ job matches → tailored DOCX on apply.
          </p>
          {progress?.complete && (
            <Link
              to="/career-ai"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
            >
              Open CareerAI
              <ArrowRight size={16} />
            </Link>
          )}
        </div>

        {progress && <SetupChecklist steps={steps} userName={user?.name} />}

        {progress?.whatsappConnected && progress?.stats?.whatsapp_display && (
          <Card className="!border-emerald-100 !bg-emerald-50/30">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                <Wifi size={20} />
              </div>
              <div>
                <p className="font-medium text-slate-900">WhatsApp connected</p>
                <p className="text-sm text-slate-600">{progress.stats.whatsapp_display}</p>
              </div>
            </div>
          </Card>
        )}

        {careerCards.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {careerCards.map(({ label, value, icon: Icon }) => (
              <Card key={label} className="!p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!progress?.complete && (
          <Card title="Next step">
            <p className="text-sm text-slate-600">
              {!progress?.businessConfigured
                ? 'Activate CareerAI above, then connect WhatsApp in Settings.'
                : 'Connect WhatsApp in Settings so job seekers can start messaging you.'}
            </p>
          </Card>
        )}

        {wizardOpen && (
          <BusinessWizard
            profile={progress?.profile}
            onClose={() => setWizardOpen(false)}
            onCreated={handleWizardCreated}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Home</h1>
        <p className="text-sm text-slate-500">WhatsApp and Instagram auto-replies — one dashboard</p>
      </div>

      {progress && <SetupChecklist steps={steps} userName={user?.name} />}

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
                </div>
              </div>
            </div>
          </Card>

          <ChannelAnalytics analytics={analytics} />

          {integrationHealth && !integrationHealth.healthy && (
            <Card title="Delivery health">
              <p className="text-sm text-amber-800">
                {integrationHealth.failed_outbound_7d} failed outbound message
                {integrationHealth.failed_outbound_7d === 1 ? '' : 's'} in the last 7 days.
              </p>
            </Card>
          )}
        </>
      )}

      {!progress?.complete && progress && (
        <Card title="What happens next?">
          <p className="text-sm leading-relaxed text-slate-600">
            Finish the steps above, then customers get instant replies on WhatsApp or Instagram.
          </p>
        </Card>
      )}

      {progress?.complete && (
        <Card title="Recent activity">
          {activities.length === 0 ? (
            <p className="text-sm text-slate-500">No activity yet.</p>
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

      {wizardOpen && !progress?.businessConfigured && (
        <BusinessWizard
          profile={progress?.profile}
          onClose={() => setWizardOpen(false)}
          onCreated={handleWizardCreated}
        />
      )}
    </div>
  );
}
