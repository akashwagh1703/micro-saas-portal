/** Apply setup-business response across local page state immediately. */
export function syncSetupBusinessResult(data, { setProfile, setWorkflows, applyBusinessProfile } = {}) {
  const profile = data?.business_profile ?? null;
  if (profile) {
    setProfile?.(profile);
    applyBusinessProfile?.(profile);
  }
  if (Array.isArray(data?.workflows)) {
    setWorkflows?.(data.workflows);
  }
  return profile;
}

/** Optimistically flip live/draft on a workflow row. */
export function patchWorkflowLive(workflows, workflowId, isLive) {
  return workflows.map((w) =>
    w.id === workflowId
      ? { ...w, status: isLive ? 'published' : 'draft', is_active: isLive }
      : w,
  );
}

/** Adjust published_count on business profile after toggle. */
export function patchProfilePublishedCount(profile, delta) {
  if (!profile) return profile;
  const count = Math.max(0, (profile.published_count ?? 0) + delta);
  return {
    ...profile,
    published_count: count,
    can_change_business: count === 0,
  };
}
