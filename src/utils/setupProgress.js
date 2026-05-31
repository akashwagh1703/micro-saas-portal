/** Tracks the setup journey for non-technical users. */
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
    const whatsappConnected = !!stats.whatsapp_connected;
    const instagramConnected = !!stats.instagram_connected;
    const channelConnected = whatsappConnected || instagramConnected;
    const hasLive =
      workflows.some((w) => w.status === 'published') || (stats.active_workflows ?? 0) > 0;

    return {
      businessConfigured: !!profile.configured,
      hasWorkflows: workflows.length > 0,
      whatsappConnected,
      whatsappDisplay: stats.whatsapp_display || null,
      instagramConnected,
      instagramUsername: stats.instagram_username || null,
      channelConnected,
      hasLive,
      stats,
      profile,
      workflows,
      complete:
        !!profile.configured && workflows.length > 0 && channelConnected && hasLive,
    };
  } catch {
    return {
      businessConfigured: false,
      hasWorkflows: false,
      whatsappConnected: false,
      whatsappDisplay: null,
      instagramConnected: false,
      instagramUsername: null,
      channelConnected: false,
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
      id: 'channels',
      title: 'Connect WhatsApp or Instagram',
      description: 'Link at least one channel in Settings — add the other anytime.',
      done: progress.channelConnected,
      href: '/settings',
      action: 'Connect a channel',
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
