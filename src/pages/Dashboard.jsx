import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
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
  CalendarClock,
} from 'lucide-react';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import SetupChecklist from '../components/onboarding/SetupChecklist';
import { formatMatchThreshold } from '../constants/career';
import TestBotCard from '../components/onboarding/TestBotCard';
import BusinessWizard from '../components/BusinessWizard';
import BusinessTypeCard from '../components/BusinessTypeCard';
import ChannelAnalytics from '../components/dashboard/ChannelAnalytics';
import api from '../services/api';
import { fetchSetupProgress, buildSetupSteps } from '../utils/setupProgress';
import { resourceLabelPlural, supportsScheduling } from '../utils/scheduling';
import { applyBusinessChange } from '../utils/businessChange';
import { syncSetupBusinessResult } from '../utils/workspaceSync';

const statConfig = [
  { key: 'total_messages', label: 'Messages handled', icon: MessageSquare, accent: 'blue' },
  { key: 'active_workflows', label: 'Auto-replies live', icon: Bot, accent: 'violet' },
  { key: 'inbox_conversations', label: 'Customer chats', icon: Inbox, accent: 'amber' },
  { key: 'contacts_count', label: 'Contacts', icon: Users, accent: 'emerald' },
  { key: 'leads_count', label: 'Leads captured', icon: UserPlus, accent: 'rose' },
];

const schedulingStatConfig = [
  { key: 'bookings_today', label: 'Bookings today', icon: CalendarClock, accent: 'blue' },
  { key: 'bookings_upcoming', label: 'Upcoming appointments', icon: CalendarClock, accent: 'amber' },
  { key: 'resources_active', label: 'Active team members', icon: Users, accent: 'emerald' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { refreshBusinessProfile, applyBusinessProfile, businessProfile: layoutProfile } =
    useOutletContext() ?? {};
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

  useEffect(() => {
    if (!layoutProfile?.configured) return;
    setProgress((prev) => {
      if (!prev) return prev;
      const careerAi = layoutProfile.business_category === 'career_ai';
      if (
        prev.profile?.business_category === layoutProfile.business_category &&
        prev.isCareerAi === careerAi
      ) {
        return prev;
      }
      return {
        ...prev,
        profile: layoutProfile,
        isCareerAi: careerAi,
        businessConfigured: layoutProfile.configured,
      };
    });
  }, [layoutProfile]);

  const refresh = () => {
    fetchSetupProgress(api).then((p) => {
      setProgress(p);
      if (p.isCareerAi && p.businessConfigured) {
        api.get('/career/analytics').then((r) => setCareerStats(r.data)).catch(() => {});
      }
    });
  };

  const handleWizardCreated = async (data) => {
    setWizardOpen(false);
    const profile = syncSetupBusinessResult(data, { applyBusinessProfile });
    if (profile) {
      setProgress((prev) =>
        prev
          ? {
              ...prev,
              profile,
              isCareerAi: profile.business_category === 'career_ai',
              businessConfigured: profile.configured,
            }
          : prev,
      );
    }
    applyBusinessChange(navigate, data);
    refresh();
    refreshBusinessProfile?.();
  };

  const steps = progress ? buildSetupSteps(progress) : [];
  const stats = progress?.stats;
  const isCareerAi = progress?.isCareerAi;
  const showSchedulingStats = supportsScheduling(progress?.profile);

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
        <div className="hero-gradient p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-100/90">CareerAI</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {user?.name ? `Hi ${user.name.split(' ')[0]}` : 'Welcome'}
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-emerald-50/95">
            Job seekers message your WhatsApp → resume parsed → {formatMatchThreshold('job matches')} → cover letters on apply.
          </p>
          {progress?.complete && (
            <Link
              to="/career-ai"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-md transition hover:bg-emerald-50"
            >
              Open CareerAI
              <ArrowRight size={16} />
            </Link>
          )}
        </div>

        {progress && <SetupChecklist steps={steps} userName={user?.name} />}

        <BusinessTypeCard
          compact
          onChanged={async (data) => {
            await refresh();
            refreshBusinessProfile?.();
            if (data) applyBusinessChange(navigate, data);
          }}
        />

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
              <StatCard key={label} icon={Icon} label={label} value={value} accent="emerald" />
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
      <PageHeader
        eyebrow="Dashboard"
        title="Home"
        description="WhatsApp and Instagram auto-replies — one dashboard"
      />

      {progress && <SetupChecklist steps={steps} userName={user?.name} />}

      {progress &&
        supportsScheduling(progress.profile) &&
        !progress.schedulingConfigured &&
        progress.schedulingApiEnabled && (
          <Card className="!p-4 border-sky-100 bg-sky-50/50">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white">
                  <CalendarClock size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Enable live slot booking</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Add your {resourceLabelPlural(progress.profile).toLowerCase()} and working hours to enable live
                    slot booking.
                  </p>
                </div>
              </div>
              <Link
                to="/scheduling/resources"
                className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:text-sky-900"
              >
                Set up scheduling
                <ArrowRight size={14} />
              </Link>
            </div>
          </Card>
        )}

      <BusinessTypeCard
        compact
        onChanged={async (data) => {
          await refresh();
          refreshBusinessProfile?.();
          if (data) applyBusinessChange(navigate, data);
        }}
      />

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
            {statConfig.map(({ key, label, icon, accent }) => (
              <StatCard
                key={key}
                icon={icon}
                label={label}
                value={stats?.[key]}
                accent={accent}
              />
            ))}
          </div>

          {showSchedulingStats && (
            <Card title="Scheduling">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-slate-600">
                  Today&apos;s appointment load from live WhatsApp booking.
                </p>
                <Link
                  to="/scheduling/bookings"
                  className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:text-sky-900"
                >
                  View bookings
                  <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {schedulingStatConfig.map(({ key, label, icon, accent }) => (
                  <StatCard
                    key={key}
                    icon={icon}
                    label={label}
                    value={stats?.[key]}
                    accent={accent}
                  />
                ))}
              </div>
            </Card>
          )}

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
