import {
  MessageSquare,
  Inbox,
  Users,
  UserPlus,
  Briefcase,
  Settings,
  Sparkles,
} from 'lucide-react';

/** Plain-language highlights — shared by login left & right panels. */
export const PORTAL_HIGHLIGHTS = [
  {
    id: 'replies',
    icon: MessageSquare,
    title: 'Auto-replies',
    line: 'Instant WhatsApp & Instagram answers',
  },
  {
    id: 'inbox',
    icon: Inbox,
    title: 'Messages',
    line: 'All chats in one inbox',
  },
  {
    id: 'contacts',
    icon: Users,
    title: 'Contacts',
    line: 'Everyone who messaged you',
  },
  {
    id: 'leads',
    icon: UserPlus,
    title: 'Leads',
    line: 'Capture interest automatically',
  },
  {
    id: 'career',
    icon: Briefcase,
    title: 'CareerAI',
    line: 'Job seekers & smart matches',
  },
  {
    id: 'settings',
    icon: Settings,
    title: 'Settings',
    line: 'Channels, AI & your plan',
  },
];

export const HOW_IT_WORKS = [
  { step: '1', title: 'Connect', line: 'WhatsApp or Instagram' },
  { step: '2', title: 'Set up', line: 'Pick your business type' },
  { step: '3', title: 'Go live', line: 'Turn replies on' },
];

export const AUTH_TRUST_LINE = {
  icon: Sparkles,
  text: 'For shops, clinics, agents & growing teams',
};

/** AutoWave logo greens — keep auth UI aligned with brand assets. */
export const AUTH_BRAND = {
  deep: '#0a3328',
  mid: '#0c3d2e',
  light: '#0f4a3a',
  accent: '#10b981',
  accentDark: '#059669',
};
