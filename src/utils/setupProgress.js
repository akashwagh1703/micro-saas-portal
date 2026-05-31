/** Tracks the 4-step journey for non-technical users. */
export async function fetchSetupProgress(api) {
  try {
    const [profileRes, statsRes, workflowsRes] = await Promise.all([
      api.get('/settings/business-profile'),
      api.get('/dashboard/stats'),
      api.get('/workflows'),
    ]);

    const workflows = workflowsRes.data?.data || [];
    const stats = statsRes.data || {};
    const profile = profileRes.data || {};
    const hasLive =
      workflows.some((w) => w.status === 'published') || (stats.active_workflows ?? 0) > 0;

    return {
      businessConfigured: !!profile.configured,
      hasWorkflows: workflows.length > 0,
      whatsappConnected: !!stats.whatsapp_connected,
      whatsappDisplay: stats.whatsapp_display || null,
      instagramConnected: !!stats.instagram_connected,
      instagramUsername: stats.instagram_username || null,
      hasLive,
      stats,
      profile,
      workflows,
      complete: !!profile.configured && workflows.length > 0 && stats.whatsapp_connected && hasLive,
    };
  } catch {
    return {
      businessConfigured: false,
      hasWorkflows: false,
      whatsappConnected: false,
      whatsappDisplay: null,
      hasLive: false,
      stats: null,
      profile: null,
      workflows: [],
      complete: false,
    };
  }
}

export function buildSetupSteps(progress) {
  return [
    {
      id: 'business',
      title: 'Tell us your business',
      description: 'Pick your industry — we create auto-replies for you.',
      done: progress.businessConfigured,
      href: '/workflows',
      action: 'Set up my business',
    },
    {
      id: 'bots',
      title: 'Create auto-replies',
      description: 'Choose what to automate (appointments, FAQs, leads…).',
      done: progress.hasWorkflows,
      href: '/workflows',
      action: 'Create auto-replies',
    },
    {
      id: 'whatsapp',
      title: 'Connect WhatsApp',
      description: 'Link your Meta WhatsApp number — takes about 5 minutes.',
      done: progress.whatsappConnected,
      href: '/settings?tab=whatsapp',
      action: 'Connect WhatsApp',
    },
    {
      id: 'live',
      title: 'Go live',
      description: 'Turn on at least one auto-reply. You can turn it off anytime.',
      done: progress.hasLive,
      href: '/workflows',
      action: 'Go live',
    },
  ];
}
