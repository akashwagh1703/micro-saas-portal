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
    line: 'Customers get instant answers on WhatsApp & Instagram',
    accent: 'from-emerald-500/20 to-teal-500/10 ring-emerald-400/20',
    iconClass: 'text-emerald-300',
    span: 'lg:col-span-7 lg:row-span-2',
    featured: true,
  },
  {
    id: 'inbox',
    icon: Inbox,
    title: 'Messages',
    line: 'Every chat in one simple inbox',
    accent: 'from-sky-500/15 to-blue-500/5 ring-sky-400/15',
    iconClass: 'text-sky-300',
    span: 'lg:col-span-5',
  },
  {
    id: 'contacts',
    icon: Users,
    title: 'Contacts',
    line: 'People who messaged you — saved for you',
    accent: 'from-violet-500/15 to-purple-500/5 ring-violet-400/15',
    iconClass: 'text-violet-300',
    span: 'lg:col-span-4',
  },
  {
    id: 'leads',
    icon: UserPlus,
    title: 'Leads',
    line: 'Capture interest while you focus on work',
    accent: 'from-amber-500/15 to-orange-500/5 ring-amber-400/15',
    iconClass: 'text-amber-300',
    span: 'lg:col-span-4',
  },
  {
    id: 'career',
    icon: Briefcase,
    title: 'CareerAI',
    line: 'Job seekers on WhatsApp — matches & cover letters',
    accent: 'from-teal-500/15 to-cyan-500/5 ring-teal-400/15',
    iconClass: 'text-teal-300',
    span: 'lg:col-span-4',
  },
  {
    id: 'settings',
    icon: Settings,
    title: 'Settings & plans',
    line: 'Connect channels, AI keys & billing in one place',
    accent: 'from-white/10 to-white/5 ring-white/10',
    iconClass: 'text-slate-300',
    span: 'lg:col-span-12',
  },
];

export const HOW_IT_WORKS = [
  { step: '1', title: 'Connect', line: 'Add WhatsApp or Instagram' },
  { step: '2', title: 'Choose business', line: 'Guided setup — no coding' },
  { step: '3', title: 'Go live', line: 'Switch replies on anytime' },
];

export const AUTH_TRUST_LINE = {
  icon: Sparkles,
  text: 'Built for shops, clinics, agents, farmers & growing teams',
};
