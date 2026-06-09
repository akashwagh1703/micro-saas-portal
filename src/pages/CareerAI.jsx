import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  FileText,
  Send,
  BarChart3,
  Bell,
  X,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Card from '../components/ui/Card';
import BusinessTypeCard from '../components/BusinessTypeCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { AutoWaveMark } from '../components/brand/AutoWaveBrand';
import { useOutletContext } from 'react-router-dom';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'profiles', label: 'Job seekers', icon: Users },
  { id: 'jobs', label: 'Jobs & matches', icon: Briefcase },
  { id: 'applications', label: 'Applications', icon: FileText },
  { id: 'alerts', label: 'Alerts', icon: Bell },
];

const APPLICATION_STATUSES = [
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'auto_apply_queued', label: 'Auto-apply queued' },
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

function findLatestGuidance(history, type) {
  const list = asList(history);
  return list.find((entry) => entry.type === type) ?? null;
}

function ProfileDetailModal({ profile, loading, onClose, onSaved, onDeleted, onRematched, onGuidanceGenerated }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rematching, setRematching] = useState(false);
  const [generatingGuidance, setGeneratingGuidance] = useState(null);
  const [savingAlerts, setSavingAlerts] = useState(false);
  const [sendingPortal, setSendingPortal] = useState(false);
  const [alertPrefs, setAlertPrefs] = useState({ whatsapp: true, email: true, in_app: true });
  const [sendingId, setSendingId] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.fullName || '',
        email: profile.email || '',
        current_location: profile.currentLocation || '',
        preferred_locations: asList(profile.preferredLocations).join(', '),
        current_salary: profile.currentSalary || '',
        expected_salary: profile.expectedSalary || '',
        notice_period: profile.noticePeriod || '',
        work_preference: profile.workPreference || '',
        preferred_roles: asList(profile.preferredRoles).join(', '),
        auto_apply_consent: !!profile.autoApplyConsent,
      });
      setEditing(false);
      setAlertPrefs({
        whatsapp: profile.alert_preferences?.whatsapp !== false,
        email: profile.alert_preferences?.email !== false,
        in_app: profile.alert_preferences?.in_app !== false,
      });
    }
  }, [profile]);

  const saveProfile = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const { data } = await api.patch(`/career/profiles/${profile.id}`, {
        full_name: form.full_name,
        email: form.email,
        current_location: form.current_location,
        preferred_locations: form.preferred_locations
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        current_salary: form.current_salary,
        expected_salary: form.expected_salary,
        notice_period: form.notice_period,
        work_preference: form.work_preference,
        preferred_roles: form.preferred_roles
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        auto_apply_consent: form.auto_apply_consent,
      });
      toast.success('Profile updated');
      setEditing(false);
      onSaved?.(data);
    } catch {
      toast.error('Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const deleteProfile = async () => {
    if (!profile?.id) return;
    if (
      !window.confirm(
        'Permanently delete this job seeker profile, resumes, applications, and generated documents? This cannot be undone.',
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/career/profiles/${profile.id}`);
      toast.success('Profile and all related data deleted');
      onDeleted?.();
    } catch {
      toast.error('Could not delete profile');
    } finally {
      setDeleting(false);
    }
  };

  const rematchProfile = async () => {
    if (!profile?.id) return;
    setRematching(true);
    try {
      const { data } = await api.post(`/career/profiles/${profile.id}/rematch`);
      toast.success(data.message || 'Profile re-matched');
      onRematched?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Re-match failed');
    } finally {
      setRematching(false);
    }
  };

  const saveAlertPreferences = async () => {
    if (!profile?.id) return;
    setSavingAlerts(true);
    try {
      await api.patch(`/career/profiles/${profile.id}/alert-preferences`, alertPrefs);
      toast.success('Alert preferences saved');
      onSaved?.({ ...profile, alert_preferences: alertPrefs });
    } catch {
      toast.error('Could not save alert preferences');
    } finally {
      setSavingAlerts(false);
    }
  };

  const sendPortalLink = async () => {
    if (!profile?.id) return;
    setSendingPortal(true);
    try {
      const { data } = await api.post(`/career/profiles/${profile.id}/portal-link`);
      toast.success(data.message || 'Portal link sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send portal link');
    } finally {
      setSendingPortal(false);
    }
  };

  const generateGuidance = async (kind) => {
    if (!profile?.id) return;
    setGeneratingGuidance(kind);
    try {
      const path =
        kind === 'full'
          ? `/career/profiles/${profile.id}/guidance/full`
          : `/career/profiles/${profile.id}/guidance/${kind}`;
      const { data } = await api.post(path);
      toast.success(data.message || 'Guidance generated');
      onGuidanceGenerated?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not generate guidance');
    } finally {
      setGeneratingGuidance(null);
    }
  };

  const guidanceHistory = asList(profile?.guidance_history ?? profile?.guidanceHistory);
  const latestRoadmap = findLatestGuidance(guidanceHistory, 'roadmap') ?? findLatestGuidance(guidanceHistory, 'full');
  const latestSkillGap = findLatestGuidance(guidanceHistory, 'skill_gap') ?? findLatestGuidance(guidanceHistory, 'full');
  const latestCerts =
    findLatestGuidance(guidanceHistory, 'certifications') ?? findLatestGuidance(guidanceHistory, 'full');
  const latestSalary = findLatestGuidance(guidanceHistory, 'salary');

  const sendToWhatsApp = async (path, label) => {
    setSendingId(path);
    try {
      const { data } = await api.post(path);
      toast.success(data.message || `${label} sent on WhatsApp`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Could not send ${label.toLowerCase()} — check WhatsApp connection`);
    } finally {
      setSendingId(null);
    }
  };

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

        {!loading && profile && (
          <div className="border-b border-slate-100 px-5 py-2">
            {editing ? (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={saveProfile} disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  Edit profile
                </Button>
                <Button variant="secondary" onClick={rematchProfile} loading={rematching}>
                  Re-match jobs
                </Button>
              </div>
            )}
          </div>
        )}

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
                {profile.autoApplyConsent && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs text-emerald-800">
                    Auto-apply on
                  </span>
                )}
              </div>

              {profile.interviewPreferences?.requested_slot && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Interview preference
                  </h3>
                  <p className="mt-2 text-sm text-slate-700">
                    {profile.interviewPreferences.requested_slot}
                    {profile.interviewPreferences.requested_at
                      ? ` · requested ${new Date(profile.interviewPreferences.requested_at).toLocaleString()}`
                      : ''}
                  </p>
                </section>
              )}

              {asList(profile.interview_sessions ?? profile.interviewSessions).length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Mock interview history
                  </h3>
                  <ul className="mt-3 space-y-3">
                    {asList(profile.interview_sessions ?? profile.interviewSessions).map((session) => (
                      <li
                        key={session.id}
                        className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium text-slate-800">
                            {session.typeLabel ?? session.type} — {session.role}
                          </span>
                          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                            {session.readinessScore}/100 · {session.readinessLabel}
                          </span>
                        </div>
                        {session.jobTitle && (
                          <p className="mt-1 text-xs text-slate-500">
                            Job: {session.jobTitle}
                            {session.company ? ` @ ${session.company}` : ''}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-500">
                          {session.questionCount} questions · avg {session.avgAnswerScore}/100
                          {session.completedAt
                            ? ` · ${new Date(session.completedAt).toLocaleString()}`
                            : ''}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Career guidance
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      className="px-3 py-1.5 text-xs"
                      loading={generatingGuidance === 'roadmap'}
                      onClick={() => generateGuidance('roadmap')}
                    >
                      Roadmap
                    </Button>
                    <Button
                      variant="secondary"
                      className="px-3 py-1.5 text-xs"
                      loading={generatingGuidance === 'skill-gap'}
                      onClick={() => generateGuidance('skill-gap')}
                    >
                      Skill gap
                    </Button>
                    <Button
                      variant="secondary"
                      className="px-3 py-1.5 text-xs"
                      loading={generatingGuidance === 'certifications'}
                      onClick={() => generateGuidance('certifications')}
                    >
                      Certifications
                    </Button>
                    <Button
                      variant="secondary"
                      className="px-3 py-1.5 text-xs"
                      loading={generatingGuidance === 'salary'}
                      onClick={() => generateGuidance('salary')}
                    >
                      Salary
                    </Button>
                    <Button
                      variant="secondary"
                      className="px-3 py-1.5 text-xs"
                      loading={generatingGuidance === 'full'}
                      onClick={() => generateGuidance('full')}
                    >
                      Full pack
                    </Button>
                  </div>
                </div>

                {!latestRoadmap?.roadmap &&
                !latestSkillGap?.skillGap &&
                !latestCerts?.certifications &&
                !latestSalary?.salary ? (
                  <p className="mt-2 text-sm text-slate-400">
                    No guidance generated yet. Use the buttons above or WhatsApp commands like CAREER ROADMAP.
                  </p>
                ) : (
                  <div className="mt-3 space-y-4">
                    {(latestRoadmap?.roadmap || latestRoadmap?.type === 'full') && latestRoadmap?.roadmap && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm">
                        <p className="font-medium text-slate-800">Career roadmap</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Current: {latestRoadmap.roadmap.currentRole}
                          {latestRoadmap.generatedAt
                            ? ` · ${new Date(latestRoadmap.generatedAt).toLocaleString()}`
                            : ''}
                        </p>
                        <ol className="mt-2 space-y-1 text-slate-700">
                          {asList(latestRoadmap.roadmap.steps).map((step, i) => (
                            <li key={i}>
                              {i + 1}. {step.role}
                              {step.timeframe ? ` (${step.timeframe})` : ''}
                              {step.focus ? ` — ${step.focus}` : ''}
                            </li>
                          ))}
                        </ol>
                        {latestRoadmap.roadmap.summary && (
                          <p className="mt-2 text-xs text-slate-600">{latestRoadmap.roadmap.summary}</p>
                        )}
                      </div>
                    )}

                    {(latestSkillGap?.skillGap || latestSkillGap?.type === 'full') && latestSkillGap?.skillGap && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm">
                        <p className="font-medium text-slate-800">Skill gap plan</p>
                        {asList(latestSkillGap.skillGap.missingSkills).length > 0 && (
                          <p className="mt-1 text-xs text-slate-500">
                            Gaps: {latestSkillGap.skillGap.missingSkills.slice(0, 8).join(', ')}
                          </p>
                        )}
                        <ul className="mt-2 space-y-2">
                          {asList(latestSkillGap.skillGap.priorities)
                            .slice(0, 4)
                            .map((p, i) => (
                              <li key={i} className="text-slate-700">
                                <span className="font-medium">{p.skill}</span>
                                {p.why ? ` — ${p.why}` : ''}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {(latestCerts?.certifications || latestCerts?.type === 'full') &&
                      latestCerts?.certifications && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm">
                        <p className="font-medium text-slate-800">Certifications</p>
                        <ul className="mt-2 space-y-2">
                          {asList(latestCerts.certifications.recommendations)
                            .slice(0, 4)
                            .map((rec, i) => (
                              <li key={i} className="text-slate-700">
                                <span className="font-medium">{rec.name}</span>
                                {rec.provider ? ` (${rec.provider})` : ''}
                                {rec.reason ? ` — ${rec.reason}` : ''}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {latestSalary?.salary && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm">
                        <p className="font-medium text-slate-800">Salary insights</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {latestSalary.salary.roles} · {latestSalary.salary.location}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
                          {latestSalary.salary.juniorRange && <span>Junior: {latestSalary.salary.juniorRange}</span>}
                          {latestSalary.salary.midRange && <span>Mid: {latestSalary.salary.midRange}</span>}
                          {latestSalary.salary.seniorRange && <span>Senior: {latestSalary.salary.seniorRange}</span>}
                        </div>
                        <p className="mt-2 text-slate-700">{latestSalary.salary.insight}</p>
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Alert channels
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Multi-channel job alerts (WhatsApp, email, candidate portal). STOP DIGEST on WhatsApp pauses all.
                </p>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!alertPrefs.whatsapp}
                      onChange={(e) => setAlertPrefs({ ...alertPrefs, whatsapp: e.target.checked })}
                    />
                    WhatsApp alerts
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!alertPrefs.email}
                      disabled={!profile.email}
                      onChange={(e) => setAlertPrefs({ ...alertPrefs, email: e.target.checked })}
                    />
                    Email alerts{!profile.email ? ' (no email on profile)' : ''}
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!alertPrefs.in_app}
                      onChange={(e) => setAlertPrefs({ ...alertPrefs, in_app: e.target.checked })}
                    />
                    In-app portal notifications
                  </label>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="secondary" loading={savingAlerts} onClick={saveAlertPreferences}>
                    Save alert settings
                  </Button>
                  <Button variant="secondary" loading={sendingPortal} onClick={sendPortalLink}>
                    Send portal link
                  </Button>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location & salary</h3>
                {editing ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Input label="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                    <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <Input label="Current location" value={form.current_location} onChange={(e) => setForm({ ...form, current_location: e.target.value })} />
                    <Input label="Preferred locations (comma-separated)" value={form.preferred_locations} onChange={(e) => setForm({ ...form, preferred_locations: e.target.value })} />
                    <Input label="Current salary" value={form.current_salary} onChange={(e) => setForm({ ...form, current_salary: e.target.value })} />
                    <Input label="Expected salary" value={form.expected_salary} onChange={(e) => setForm({ ...form, expected_salary: e.target.value })} />
                    <Input label="Notice period" value={form.notice_period} onChange={(e) => setForm({ ...form, notice_period: e.target.value })} />
                    <Input label="Work preference" value={form.work_preference} onChange={(e) => setForm({ ...form, work_preference: e.target.value })} />
                    <Input className="sm:col-span-2" label="Preferred roles (comma-separated)" value={form.preferred_roles} onChange={(e) => setForm({ ...form, preferred_roles: e.target.value })} />
                    <label className="flex items-center gap-2 sm:col-span-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={!!form.auto_apply_consent}
                        onChange={(e) => setForm({ ...form, auto_apply_consent: e.target.checked })}
                      />
                      Assisted auto-apply (queue APPLY actions for operator submission)
                    </label>
                  </div>
                ) : (
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
                )}
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
                        className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800"
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
                        <span className="shrink-0 text-sm font-bold text-emerald-700">
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
                      <li key={r.id} className="flex items-center justify-between gap-2">
                        <span>
                          {r.fileName || r.type}
                          {r.isMaster ? ' (master)' : ''}
                          {r.createdAt
                            ? ` · ${new Date(r.createdAt).toLocaleDateString()}`
                            : ''}
                        </span>
                        {r.filePath && (
                          <button
                            type="button"
                            onClick={() => downloadCareerFile(`/career/resumes/${r.id}/download`, r.fileName || 'resume')}
                            className="shrink-0 text-xs font-medium text-emerald-700 hover:underline"
                          >
                            Download
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Generated resumes
                </h3>
                {asList(profile.resumes).flatMap((r) => asList(r.versions)).length === 0 ? (
                  <p className="mt-2 text-sm text-slate-400">No tailored resumes yet</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {profile.resumes.flatMap((r) =>
                      asList(r.versions).map((v) => (
                        <li key={v.id} className="flex items-center justify-between gap-2">
                          <span>
                            {v.title || 'Tailored resume'}
                            {v.job?.title ? ` · ${v.job.title}` : ''}
                            {v.createdAt
                              ? ` · ${new Date(v.createdAt).toLocaleDateString()}`
                              : ''}
                          </span>
                          {(v.filePathDocx || v.filePath) && (
                            <span className="flex shrink-0 gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  downloadCareerFile(
                                    `/career/resume-versions/${v.id}/download`,
                                    `${v.title || 'resume'}.docx`,
                                  )
                                }
                                className="text-xs font-medium text-emerald-700 hover:underline"
                              >
                                Download
                              </button>
                              <button
                                type="button"
                                disabled={sendingId === `/career/resume-versions/${v.id}/send`}
                                onClick={() =>
                                  sendToWhatsApp(
                                    `/career/resume-versions/${v.id}/send`,
                                    'Resume',
                                  )
                                }
                                className="text-xs font-medium text-emerald-700 hover:underline disabled:opacity-50"
                              >
                                {sendingId === `/career/resume-versions/${v.id}/send`
                                  ? 'Sending…'
                                  : 'Send on WhatsApp'}
                              </button>
                            </span>
                          )}
                        </li>
                      )),
                    )}
                  </ul>
                )}
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cover letters</h3>
                {asList(profile.coverLetters).length === 0 ? (
                  <p className="mt-2 text-sm text-slate-400">No cover letters yet</p>
                ) : (
                  <ul className="mt-2 space-y-3">
                    {profile.coverLetters.map((cl) => (
                      <li key={cl.id} className="rounded-lg border border-slate-100 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900">
                            {cl.job?.title ? `${cl.job.title} @ ${cl.job.company}` : 'Cover letter'}
                            {cl.createdAt
                              ? ` · ${new Date(cl.createdAt).toLocaleDateString()}`
                              : ''}
                          </p>
                          <span className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                downloadCareerFile(
                                  `/career/cover-letters/${cl.id}/download`,
                                  `cover-letter-${cl.id}.docx`,
                                )
                              }
                              className="text-xs font-medium text-emerald-700 hover:underline"
                            >
                              Download
                            </button>
                            <button
                              type="button"
                              disabled={sendingId === `/career/cover-letters/${cl.id}/send`}
                              onClick={() =>
                                sendToWhatsApp(`/career/cover-letters/${cl.id}/send`, 'Cover letter')
                              }
                              className="text-xs font-medium text-emerald-700 hover:underline disabled:opacity-50"
                            >
                              {sendingId === `/career/cover-letters/${cl.id}/send`
                                ? 'Sending…'
                                : 'Send on WhatsApp'}
                            </button>
                          </span>
                        </div>
                        <p className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap text-xs text-slate-600">
                          {cl.content}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-lg border border-red-100 bg-red-50/50 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-red-700">
                  Data deletion (GDPR / DPDP)
                </h3>
                <p className="mt-2 text-xs text-red-800">
                  Permanently removes this profile, resume files, matches, applications, cover letters, and
                  notifications. Use when a job seeker requests erasure.
                </p>
                <Button
                  variant="secondary"
                  className="mt-3 border-red-200 text-red-700 hover:bg-red-100"
                  onClick={deleteProfile}
                  disabled={deleting || editing}
                >
                  {deleting ? 'Deleting…' : 'Delete all profile data'}
                </Button>
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

async function downloadCareerFile(path, fileName) {
  try {
    const res = await api.get(path, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch {
    toast.error('Download failed');
  }
}

export default function CareerAI() {
  const navigate = useNavigate();
  const { refreshBusinessProfile } = useOutletContext() ?? {};
  const [tab, setTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [fetchKeyword, setFetchKeyword] = useState('');
  const [fetchLocation, setFetchLocation] = useState('india');
  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [profileDetail, setProfileDetail] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [updatingAppId, setUpdatingAppId] = useState(null);
  const [storageStatus, setStorageStatus] = useState(null);
  const [jobSources, setJobSources] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [a, p, j, m, apps, storage, sources, notifs] = await Promise.all([
        api.get('/career/analytics'),
        api.get('/career/profiles'),
        api.get('/career/jobs'),
        api.get('/career/matches'),
        api.get('/career/applications'),
        api.get('/career/storage/status').catch(() => ({ data: null })),
        api.get('/career/job-sources').catch(() => ({ data: { sources: [] } })),
        api.get('/career/notifications').catch(() => ({ data: [] })),
      ]);
      setAnalytics(a.data);
      setProfiles(p.data.items ?? []);
      setJobs(j.data ?? []);
      setMatches(m.data ?? []);
      setApplications(apps.data ?? []);
      setStorageStatus(storage.data);
      setJobSources(sources.data?.sources ?? []);
      setNotifications(Array.isArray(notifs.data) ? notifs.data : []);
    } catch (err) {
      const message = err.response?.data?.message || 'Could not load CareerAI data';
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api
      .get('/settings/business-profile')
      .then((r) => {
        if (r.data?.business_category !== 'career_ai') {
          navigate('/dashboard', { replace: true });
          return;
        }
        if (!r.data?.configured) {
          navigate('/dashboard', { replace: true });
        }
      })
      .catch(() => navigate('/dashboard', { replace: true }));
  }, [navigate]);

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
      if (data.by_source) {
        const zeroSources = Object.entries(data.by_source)
          .filter(([, n]) => n === 0)
          .map(([id]) => id);
        if (zeroSources.length > 0 && data.count === 0) {
          toast.error(`No jobs stored — check: ${zeroSources.join(', ')}`);
        }
      }
      if (data.errors && Object.keys(data.errors).length > 0) {
        toast.error(
          Object.entries(data.errors)
            .map(([src, err]) => `${src}: ${err}`)
            .join(' · '),
        );
      }
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
      toast.success(data.message || 'Job refresh started');
      if (data.status === 'started') {
        window.setTimeout(() => load(), 45_000);
        window.setTimeout(() => load(), 90_000);
      } else {
        load();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Refresh failed — check Adzuna and JSearch API keys in server .env',
      );
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
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <AutoWaveMark />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">CareerAI</p>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Job seeker operations</h1>
              <p className="mt-1 text-sm text-slate-500">
                WhatsApp bot · 70%+ matches · tailored DOCX
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={runDigest}>
              <Send size={16} className="mr-1 inline" />
              Run digest
            </Button>
            <Button variant="secondary" onClick={seedJobs}>
              Sample jobs
            </Button>
          </div>
        </div>
      </div>

      {loadError && !loading && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-900">
          <p className="font-medium">Could not load CareerAI</p>
          <p className="mt-1">{loadError}</p>
          <Button className="mt-3" variant="secondary" onClick={load}>
            Retry
          </Button>
        </div>
      )}

      {storageStatus && !storageStatus.ok && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Resume storage warning:</strong>{' '}
          {storageStatus.backend === 'local'
            ? 'Files are stored on local disk only — they may be lost on redeploy. Set MINIO_* env vars on the API server.'
            : `MinIO bucket "${storageStatus.bucket}" is not reachable. ${storageStatus.error || 'Check MINIO_ENDPOINT uses port 9000 (API), not 9001 (console).'}`}
        </div>
      )}

      {storageStatus?.ok && storageStatus.backend === 'object' && (
        <p className="text-xs text-emerald-700">
          Resume storage: MinIO bucket <span className="font-medium">{storageStatus.bucket}</span> connected
        </p>
      )}

      <BusinessTypeCard compact onChanged={() => refreshBusinessProfile?.()} />

      <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
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
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ['Job seekers', analytics.profiles],
                  ['Ready profiles', analytics.complete_profiles],
                  ['Active jobs', analytics.jobs],
                  ['70%+ matches', analytics.matches],
                  ['Applications', analytics.applications],
                  ['AI tokens (month)', analytics.ai_usage?.total_tokens ?? 0],
                ].map(([label, value]) => (
                  <Card key={label} className="!border-emerald-50">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
                  </Card>
                ))}
              </div>
              <Card title="Quick actions">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <Input
                      label="Fetch jobs"
                      placeholder="e.g. React Developer"
                      value={fetchKeyword}
                      onChange={(e) => setFetchKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
                    />
                  </div>
                  <div className="w-full sm:w-36">
                    <Input
                      label="Location"
                      placeholder="india"
                      value={fetchLocation}
                      onChange={(e) => setFetchLocation(e.target.value)}
                    />
                  </div>
                  <Button onClick={fetchJobs} loading={fetching}>
                    Fetch
                  </Button>
                  <Button variant="secondary" onClick={refreshAllJobs} loading={refreshing}>
                    <RefreshCw size={16} className="mr-1 inline" />
                    Refresh
                  </Button>
                </div>
              </Card>
            </>
          )}

          {tab === 'profiles' && (
            <Card>
              <p className="mb-3 text-xs text-slate-500">
                Candidates appear when they message your WhatsApp number.
              </p>
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
                <p className="mb-3 text-sm font-medium text-slate-900">Job sources</p>
                <ul className="space-y-2">
                  {jobSources.length === 0 ? (
                    <li className="text-xs text-slate-500">Loading sources…</li>
                  ) : (
                    jobSources.map((s) => (
                      <li
                        key={s.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-slate-900">{s.name}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            s.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {s.enabled ? 'Connected' : 'Not configured'}
                        </span>
                        <p className="w-full text-xs text-slate-500">{s.message}</p>
                      </li>
                    ))
                  )}
                </ul>
              </Card>

              <Card>
                <p className="mb-3 text-sm font-medium text-slate-900">Fetch jobs</p>
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
                                className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline"
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

              <Card title="70%+ matches">
                <p className="mb-3 text-xs text-slate-500">
                  Shown to job seekers on WhatsApp when score is 70% or higher.
                </p>
                <div className="divide-y divide-slate-100">
                  {matches.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-500">No matches yet — fetch jobs first.</p>
                  ) : (
                    matches.slice(0, 30).map((m) => (
                      <div key={m.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">{m.job?.title}</p>
                          <p className="text-xs text-slate-500">
                            {m.profile?.fullName || m.profile?.contact?.phone}
                            {m.job?.company ? ` · ${m.job.company}` : ''}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-sm font-bold text-emerald-800">
                            {Math.round(m.score)}%
                          </span>
                          {m.profileId && (
                            <button
                              type="button"
                              onClick={() => openProfile(m.profileId)}
                              className="text-xs text-emerald-700 hover:underline"
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
            </div>
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
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
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

          {tab === 'alerts' && (
            <Card title="Job alert history">
              <p className="mb-3 text-xs text-slate-500">
                Instant alerts, daily digests, and delivery status across WhatsApp, email, and candidate portal.
              </p>
              <div className="divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">No alerts recorded yet.</p>
                ) : (
                  notifications.map((n) => {
                    const channels = n.payload?.channels;
                    const channelParts = [];
                    if (channels?.whatsapp === 'sent') channelParts.push('WhatsApp');
                    if (channels?.email === 'sent') channelParts.push('Email');
                    if (channels?.in_app === 'sent') channelParts.push('Portal');
                    return (
                      <div key={n.id} className="py-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-slate-900">
                              {n.payload?.title || n.type}
                            </p>
                            <p className="text-xs text-slate-500">
                              {n.profile?.fullName || n.profile?.contact?.phone || 'Profile'}
                              {n.sentAt || n.createdAt
                                ? ` · ${new Date(n.sentAt || n.createdAt).toLocaleString()}`
                                : ''}
                            </p>
                            {n.payload?.summary && (
                              <p className="mt-1 text-sm text-slate-600">{n.payload.summary}</p>
                            )}
                            {channelParts.length > 0 && (
                              <p className="mt-1 text-xs text-slate-400">Delivered: {channelParts.join(', ')}</p>
                            )}
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                              n.status === 'sent'
                                ? 'bg-emerald-100 text-emerald-800'
                                : n.status === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {n.status}
                          </span>
                        </div>
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
          onSaved={(data) => {
            setProfileDetail(data);
            load();
          }}
          onDeleted={() => {
            closeProfile();
            load();
          }}
          onRematched={() => {
            openProfile(selectedProfileId);
            load();
          }}
          onGuidanceGenerated={() => {
            openProfile(selectedProfileId);
          }}
        />
      )}
    </div>
  );
}
