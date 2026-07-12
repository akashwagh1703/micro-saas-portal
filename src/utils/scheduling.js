/** Scheduling helpers — mirror API vertical defaults. */

const RESOURCE_LABELS = {
  salon: 'Barber',
  clinic: 'Doctor',
  coaching: 'Counselor',
  real_estate: 'Agent',
  ca_accountant: 'Consultant',
  travel: 'Agent',
};

const RESOURCE_TYPES = {
  salon: 'barber',
  clinic: 'doctor',
  coaching: 'counselor',
  real_estate: 'agent',
  ca_accountant: 'consultant',
  travel: 'agent',
};

export const WEEKDAYS = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

export function supportsScheduling(profile) {
  if (!profile?.configured || profile.business_category === 'career_ai') return false;
  return (profile.use_cases || []).includes('appointment_booking');
}

export function resourceLabel(profile) {
  return RESOURCE_LABELS[profile?.business_category] || 'Resource';
}

export function resourceLabelPlural(profile) {
  const label = resourceLabel(profile);
  if (label === 'Barber') return 'Barbers';
  if (label === 'Doctor') return 'Doctors';
  if (label === 'Agent') return 'Agents';
  return `${label}s`;
}

export function defaultResourceType(profile) {
  return RESOURCE_TYPES[profile?.business_category] || 'room';
}

export function formatSlotTime(iso, timeZone = 'Asia/Kolkata') {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleString();
  }
}

export function todayDateStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDaysDateStr(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function isSchedulingApiUnavailable(err) {
  return err?.response?.status === 404;
}

export function hasActiveSchedules(resources) {
  return (resources || []).some((r) => r.is_active !== false && (r.schedules || []).some((s) => s.is_active !== false));
}

export function defaultSalonWeekSchedule() {
  return [1, 2, 3, 4, 5, 6].map((day) => ({
    day_of_week: day,
    start_time: '09:00',
    end_time: '19:00',
    slot_minutes: 30,
    is_active: true,
  }));
}
