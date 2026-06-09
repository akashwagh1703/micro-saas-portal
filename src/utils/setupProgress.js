/** Tracks the setup journey for non-technical users. */
export function isCareerAiBusiness(profile) {
  return profile?.business_category === 'career_ai';
}

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
    const careerAi = isCareerAiBusiness(profile);
    const businessConfigured = !!profile.configured;

    let careerHasJobs = false;
    if (careerAi && businessConfigured) {
      try {
        const careerRes = await api.get('/career/analytics');
        careerHasJobs = (careerRes.data?.jobs ?? 0) > 0;
      } catch {
        careerHasJobs = false;
      }
    }

    return {
      businessConfigured,
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
      isCareerAi: careerAi,
      careerHasJobs,
      complete: careerAi
        ? businessConfigured && whatsappConnected
        : businessConfigured && workflows.length > 0 && channelConnected && hasLive,
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
      isCareerAi: false,
      careerHasJobs: false,
      complete: false,
    };
  }
}

export function buildSetupSteps(progress) {
  if (progress.isCareerAi) {
    return [
      {
        id: 'business',
        title: 'Activate CareerAI',
        description: 'One-click setup for job seeker WhatsApp bot.',
        done: progress.businessConfigured,
        href: '/dashboard',
        action: 'Activate',
      },
      {
        id: 'channels',
        title: 'Connect WhatsApp',
        description: 'Job seekers message your WhatsApp number to start.',
        done: progress.whatsappConnected,
        href: '/settings',
        action: 'Connect WhatsApp',
      },
      {
        id: 'jobs',
        title: 'Add job listings',
        description: 'Fetch roles so seekers get 70%+ matches.',
        done: progress.careerHasJobs,
        href: '/career-ai',
        action: 'Fetch jobs',
      },
    ];
  }

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
