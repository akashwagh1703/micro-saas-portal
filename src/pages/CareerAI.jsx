import { useCallback, useEffect, useState } from 'react';
import {
  Briefcase,
  Users,
  FileText,
  Target,
  Send,
  BarChart3,
  X,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Bell,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'profiles', label: 'Profiles', icon: Users },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'matches', label: 'Matches', icon: Target },
  { id: 'applications', label: 'Applications', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const APPLICATION_STATUSES = [
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'interview', label: 'Interview' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'offer', label: 'Offer' },
  { value: 'accepted', label: 'Accepted' },
];

function asList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [];
}

function formatJsonList(items, renderItem) {
  const list = asList(items);
  if (list.length === 0) return <p className="text-sm text-slate-400">—</p>;
  return (
    <ul className="space-y-1 text-sm text-slate-700">
      {list.map((item, i) => (
        <li key={i}>{renderItem(item, i)}</li>
      ))}
    </ul>
  );
}

function ProfileDetailModal({ profile, loading, onClose }) {
  if (!profile && !loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {profile?.fullName || profile?.contact?.name || 'Profile'}
            </h2>
            <p className="text-xs text-slate-500">
              {profile?.contact?.phone}
              {profile?.email ? ` · ${profile.email}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="text-sm text-slate-500">Loading profile…</p>
          ) : profile ? (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    profile.isComplete
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {profile.isComplete ? 'Complete' : `Onboarding: ${profile.onboardingStep}`}
                </span>
                {profile.workPreference && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
                    {profile.workPreference}
                  </span>
                )}
                {profile.digestOptOut && (
                  <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-700">
                    Digest opted out
                  </span>
                )}
              </div>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location & salary</h3>
                <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">Current location</dt>
                    <dd className="font-medium">{profile.currentLocation || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Preferred locations</dt>
                    <dd className="font-medium">
                      {asList(profile.preferredLocations).join(', ') || '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Current salary</dt>
                    <dd className="font-medium">{profile.currentSalary || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Expected salary</dt>
                    <dd className="font-medium">{profile.expectedSalary || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Notice period</dt>
                    <dd className="font-medium">{profile.noticePeriod || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Preferred roles</dt>
                    <dd className="font-medium">{asList(profile.preferredRoles).join(', ') || '—'}</dd>
                  </div>
                </dl>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Skills</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {asList(profile.skills).length === 0 ? (
                    <p className="text-sm text-slate-400">—</p>
                  ) : (
                    asList(profile.skills).map((s, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-800"
                      >
                        {String(s)}
                      </span>
                    ))
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Experience</h3>
                <div className="mt-2">
                  {formatJsonList(profile.experience, (exp) => (
                    <span>
                      <strong>{exp.title || 'Role'}</strong>
                      {exp.company ? ` @ ${exp.company}` : ''}
                      {exp.years ? ` (${exp.years}y)` : ''}
                      {exp.summary ? ` — ${exp.summary}` : ''}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Education</h3>
                <div className="mt-2">
                  {formatJsonList(profile.education, (edu) => (
                    <span>
                      {edu.degree || 'Degree'}
                      {edu.institution ? ` — ${edu.institution}` : ''}
                      {edu.year ? ` (${edu.year})` : ''}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Top job matches
                </h3>
                {asList(profile.jobMatches).length === 0 ? (
                  <p className="mt-2 text-sm text-slate-400">No matches yet</p>
                ) : (
                  <div className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-100">
                    {profile.jobMatches.slice(0, 10).map((m) => (
                      <div key={m.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {m.job?.title} @ {m.job?.company}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {m.job?.location || '—'} · {m.job?.salaryText || '—'}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-bold text-violet-700">
                          {Math.round(m.score)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resumes</h3>
                {asList(profile.resumes).length === 0 ? (
                  <p className="mt-2 text-sm text-slate-400">No resumes uploaded</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {profile.resumes.map((r) => (
                      <li key={r.id}>
                        {r.fileName || r.type}
                        {r.isMaster ? ' (master)' : ''}
                        {r.createdAt
                          ? ` · ${new Date(r.createdAt).toLocaleDateString()}`
                          : ''}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          ) : (
            <p className="text-sm text-red-600">Profile not found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CareerAI() {
  const [tab, setTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fetchKeyword, setFetchKeyword] = useState('');
  const [fetchLocation, setFetchLocation] = useState('india');
  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [profileDetail, setProfileDetail] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [updatingAppId, setUpdatingAppId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, p, j, m, apps, notifs] = await Promise.all([
        api.get('/career/analytics'),
        api.get('/career/profiles'),
        api.get('/career/jobs'),
        api.get('/career/matches'),
        api.get('/career/applications'),
        api.get('/career/notifications'),
      ]);
      setAnalytics(a.data);
      setProfiles(p.data.items ?? []);
      setJobs(j.data ?? []);
      setMatches(m.data ?? []);
      setApplications(apps.data ?? []);
      setNotifications(notifs.data ?? []);
    } catch {
      toast.error('Could not load CareerAI data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openProfile = async (id) => {
    setSelectedProfileId(id);
    setProfileDetail(null);
    setProfileLoading(true);
    try {
      const { data } = await api.get(`/career/profiles/${id}`);
      setProfileDetail(data);
    } catch {
      toast.error('Could not load profile');
      setSelectedProfileId(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const closeProfile = () => {
    setSelectedProfileId(null);
    setProfileDetail(null);
  };

  const seedJobs = async () => {
    try {
      await api.post('/career/jobs/seed');
      toast.success('Sample jobs added');
      load();
    } catch {
      toast.error('Failed to seed jobs');
    }
  };

  const fetchJobs = async () => {
    if (!fetchKeyword.trim()) {
      toast.error('Enter a keyword (e.g. React Developer)');
      return;
    }
    setFetching(true);
    try {
      const { data } = await api.post('/career/jobs/fetch', {
        keyword: fetchKeyword.trim(),
        location: fetchLocation.trim() || 'india',
      });
      toast.success(data.message || `Fetched ${data.count} jobs`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Job fetch failed');
    } finally {
      setFetching(false);
    }
  };

  const refreshAllJobs = async () => {
    setRefreshing(true);
    try {
      const { data } = await api.post('/career/jobs/refresh');
      toast.success(data.message || 'Job refresh complete');
      load();
    } catch {
      toast.error('Refresh failed — check Adzuna API keys');
    } finally {
      setRefreshing(false);
    }
  };

  const runDigest = async () => {
    try {
      const { data } = await api.post('/career/digest/run');
      toast.success(
        data.message ||
          `Digest: ${data.sent} sent, ${data.skipped} skipped, ${data.failed} failed`,
      );
      load();
    } catch {
      toast.error('Digest failed');
    }
  };

  const updateApplicationStatus = async (appId, status) => {
    setUpdatingAppId(appId);
    try {
      await api.patch(`/career/applications/${appId}/status`, { status });
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status } : a)),
      );
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingAppId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CareerAI Bot</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage job seekers, resumes, matching, and WhatsApp career assistant flows.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={seedJobs}>
            Seed sample jobs
          </Button>
          <Button variant="secondary" onClick={runDigest}>
            <Send size={16} className="mr-1 inline" />
            Run daily digest
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
              tab === id ? 'bg-violet-100 text-violet-900' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <>
          {tab === 'overview' && analytics && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['Profiles', analytics.profiles],
                ['Complete profiles', analytics.complete_profiles],
                ['Resumes', analytics.resumes],
                ['Active jobs', analytics.jobs],
                ['Matches', analytics.matches],
                ['Applications', analytics.applications],
              ].map(([label, value]) => (
                <Card key={label}>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
                </Card>
              ))}
            </div>
          )}

          {tab === 'profiles' && (
            <Card>
              <p className="mb-3 text-xs text-slate-500">Click a profile to view skills, experience, and matches.</p>
              <div className="divide-y divide-slate-100">
                {profiles.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">
                    No career profiles yet. Job seekers appear when they message your WhatsApp.
                  </p>
                ) : (
                  profiles.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => openProfile(p.id)}
                      className="flex w-full items-center justify-between gap-2 py-3 text-left hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {p.fullName || p.contact?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {p.contact?.phone} · {p.onboardingStep}
                          {p.currentLocation ? ` · ${p.currentLocation}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            p.isComplete
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.isComplete ? 'Complete' : 'Onboarding'}
                        </span>
                        <ChevronRight size={16} className="text-slate-400" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>
          )}

          {tab === 'jobs' && (
            <div className="space-y-4">
              <Card>
                <p className="mb-3 text-sm font-medium text-slate-900">Fetch real jobs (Adzuna)</p>
                <p className="mb-4 text-xs text-slate-500">
                  Requires ADZUNA_APP_ID and ADZUNA_APP_KEY on the API server. Jobs are stored and matched against profiles.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <Input
                      label="Keyword"
                      placeholder="e.g. React Developer"
                      value={fetchKeyword}
                      onChange={(e) => setFetchKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
                    />
                  </div>
                  <div className="w-full sm:w-40">
                    <Input
                      label="Location"
                      placeholder="india"
                      value={fetchLocation}
                      onChange={(e) => setFetchLocation(e.target.value)}
                    />
                  </div>
                  <Button onClick={fetchJobs} loading={fetching}>
                    Fetch jobs
                  </Button>
                  <Button variant="secondary" onClick={refreshAllJobs} loading={refreshing}>
                    <RefreshCw size={16} className="mr-1 inline" />
                    Refresh all
                  </Button>
                </div>
              </Card>

              <Card>
                <p className="mb-3 text-xs text-slate-500">{jobs.length} active job(s)</p>
                <div className="divide-y divide-slate-100">
                  {jobs.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-500">
                      No jobs yet. Seed samples or fetch from Adzuna above.
                    </p>
                  ) : (
                    jobs.map((j) => (
                      <div key={j.id} className="py-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-slate-900">
                              {j.title} @ {j.company}
                            </p>
                            <p className="text-xs text-slate-500">
                              {j.location || j.city || '—'} · {j.salaryText || '—'}
                              {j.jobType ? ` · ${j.jobType}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {j.source && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-600">
                                {j.source}
                              </span>
                            )}
                            {j.applyUrl && (
                              <a
                                href={j.applyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-violet-700 hover:underline"
                              >
                                Apply <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          )}

          {tab === 'matches' && (
            <Card>
              <div className="divide-y divide-slate-100">
                {matches.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">No matches yet.</p>
                ) : (
                  matches.slice(0, 50).map((m) => (
                    <div key={m.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{m.job?.title}</p>
                        <p className="text-xs text-slate-500">
                          {m.profile?.fullName || m.profile?.contact?.phone}
                          {m.job?.company ? ` · ${m.job.company}` : ''}
                        </p>
                        {asList(m.matchFactors).length > 0 && (
                          <p className="mt-0.5 truncate text-[11px] text-emerald-700">
                            {asList(m.matchFactors).slice(0, 2).join(' · ')}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="font-bold text-violet-700">{Math.round(m.score)}%</span>
                        {m.profileId && (
                          <button
                            type="button"
                            onClick={() => openProfile(m.profileId)}
                            className="text-xs text-violet-600 hover:underline"
                          >
                            Profile
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {tab === 'applications' && (
            <Card>
              <p className="mb-3 text-xs text-slate-500">Update application status for each candidate.</p>
              <div className="divide-y divide-slate-100">
                {applications.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">No applications yet.</p>
                ) : (
                  applications.map((a) => (
                    <div
                      key={a.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900">
                          {a.job?.title} @ {a.job?.company}
                        </p>
                        <p className="text-xs text-slate-500">
                          {a.profile?.fullName || a.profile?.contact?.phone || 'Candidate'}
                          {a.updatedAt
                            ? ` · updated ${new Date(a.updatedAt).toLocaleDateString()}`
                            : ''}
                        </p>
                      </div>
                      <select
                        value={a.status}
                        disabled={updatingAppId === a.id}
                        onChange={(e) => updateApplicationStatus(a.id, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
                      >
                        {APPLICATION_STATUSES.map(({ value, label }) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {tab === 'notifications' && (
            <Card>
              <p className="mb-3 text-xs text-slate-500">
                Daily digest delivery log — sent, skipped (no matches), or failed.
              </p>
              <div className="divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">
                    No notifications yet. Run a digest or wait for the daily cron job.
                  </p>
                ) : (
                  notifications.map((n) => {
                    const name =
                      n.profile?.fullName ||
                      n.profile?.contact?.name ||
                      n.profile?.contact?.phone ||
                      `Profile #${n.profileId}`;
                    const statusColor =
                      n.status === 'sent'
                        ? 'bg-emerald-100 text-emerald-800'
                        : n.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-600';
                    const when = n.sentAt || n.createdAt;
                    const payload = n.payload || {};
                    return (
                      <div key={n.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">{name}</p>
                          <p className="text-xs text-slate-500">
                            {n.type.replace(/_/g, ' ')}
                            {when ? ` · ${new Date(when).toLocaleString()}` : ''}
                          </p>
                          {payload.matchCount != null && (
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {payload.matchCount} matches
                              {payload.reason ? ` · ${payload.reason}` : ''}
                            </p>
                          )}
                          {payload.error && (
                            <p className="mt-0.5 text-[11px] text-red-600">{String(payload.error)}</p>
                          )}
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
                          {n.status}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          )}
        </>
      )}

      {selectedProfileId && (
        <ProfileDetailModal
          profile={profileDetail}
          loading={profileLoading}
          onClose={closeProfile}
        />
      )}

      <Card className="border-violet-100 bg-violet-50/50">
        <p className="text-sm font-medium text-violet-900">WhatsApp commands (job seekers)</p>
        <p className="mt-2 text-xs text-violet-800">
          FIND JOBS · VIEW JOBS · SHOW APPLICATIONS · GENERATE RESUME · CAREER ADVICE · STOP DIGEST · START DIGEST
        </p>
      </Card>
    </div>
  );
}
