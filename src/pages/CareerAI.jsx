import { useEffect, useState } from 'react';
import { Briefcase, Users, FileText, Target, Send, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'profiles', label: 'Profiles', icon: Users },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'matches', label: 'Matches', icon: Target },
  { id: 'applications', label: 'Applications', icon: FileText },
];

export default function CareerAI() {
  const [tab, setTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [a, p, j, m, apps] = await Promise.all([
        api.get('/career/analytics'),
        api.get('/career/profiles'),
        api.get('/career/jobs'),
        api.get('/career/matches'),
        api.get('/career/applications'),
      ]);
      setAnalytics(a.data);
      setProfiles(p.data.items ?? []);
      setJobs(j.data ?? []);
      setMatches(m.data ?? []);
      setApplications(apps.data ?? []);
    } catch {
      toast.error('Could not load CareerAI data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const seedJobs = async () => {
    try {
      await api.post('/career/jobs/seed');
      toast.success('Sample jobs added');
      load();
    } catch {
      toast.error('Failed to seed jobs');
    }
  };

  const runDigest = async () => {
    try {
      const { data } = await api.post('/career/digest/run');
      toast.success(`Digest sent to ${data.sent} profile(s)`);
      load();
    } catch {
      toast.error('Digest failed');
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
          <Button variant="secondary" onClick={seedJobs}>Seed sample jobs</Button>
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
              <div className="divide-y divide-slate-100">
                {profiles.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">No career profiles yet. Job seekers appear when they message your WhatsApp.</p>
                ) : (
                  profiles.map((p) => (
                    <div key={p.id} className="flex flex-wrap justify-between gap-2 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{p.fullName || p.contact?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{p.contact?.phone} · {p.onboardingStep}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${p.isComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {p.isComplete ? 'Complete' : 'Onboarding'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {tab === 'jobs' && (
            <Card>
              <div className="divide-y divide-slate-100">
                {jobs.map((j) => (
                  <div key={j.id} className="py-3">
                    <p className="font-medium">{j.title} @ {j.company}</p>
                    <p className="text-xs text-slate-500">{j.location} · {j.salaryText || '—'}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {tab === 'matches' && (
            <Card>
              <div className="divide-y divide-slate-100">
                {matches.slice(0, 30).map((m) => (
                  <div key={m.id} className="flex justify-between py-3">
                    <div>
                      <p className="font-medium">{m.job?.title}</p>
                      <p className="text-xs text-slate-500">{m.profile?.fullName || m.profile?.contact?.phone}</p>
                    </div>
                    <span className="font-bold text-violet-700">{Math.round(m.score)}%</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {tab === 'applications' && (
            <Card>
              <div className="divide-y divide-slate-100">
                {applications.map((a) => (
                  <div key={a.id} className="flex justify-between py-3">
                    <div>
                      <p className="font-medium">{a.job?.title} @ {a.job?.company}</p>
                      <p className="text-xs text-slate-500">{a.profile?.fullName}</p>
                    </div>
                    <span className="text-xs font-medium uppercase text-slate-600">{a.status}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      <Card className="border-violet-100 bg-violet-50/50">
        <p className="text-sm font-medium text-violet-900">WhatsApp commands (job seekers)</p>
        <p className="mt-2 text-xs text-violet-800">
          FIND JOBS · VIEW JOBS · SHOW APPLICATIONS · GENERATE RESUME · GENERATE COVER LETTER · CAREER ADVICE · PREPARE INTERVIEW
        </p>
        <p className="mt-2 text-xs text-violet-700">
          Future: browser extension, ATS, auto-apply, LinkedIn, Naukri — architecture placeholders only in V1.
        </p>
      </Card>
    </div>
  );
}
