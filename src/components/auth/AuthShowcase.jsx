import { useCallback, useEffect, useState } from 'react';
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Inbox,
  MessageSquare,
  Settings,
  Smartphone,
  Wand2,
  Workflow,
  Zap,
  Users,
  BarChart3,
} from 'lucide-react';
import { AutoWaveLogoDark } from '../brand/AutoWaveBrand';

const SLIDE_INTERVAL_MS = 7000;

const SLIDES = [
  {
    step: 1,
    icon: MessageSquare,
    title: 'AutoWave',
    subtitle: 'Automate customer conversations on WhatsApp — without writing code.',
    points: [
      'Built for small businesses and teams',
      'Visual workflow builder with AI built in',
      'One dashboard for bots, inbox, and contacts',
    ],
    Visual: OverviewVisual,
  },
  {
    step: 2,
    icon: Smartphone,
    title: 'Connect WhatsApp',
    subtitle: 'Link your Meta WhatsApp Business API in Settings.',
    points: [
      'Add Phone Number ID and access token',
      'Configure webhook for incoming messages',
      'Status shows connected when ready',
    ],
    Visual: ConnectVisual,
  },
  {
    step: 3,
    icon: Wand2,
    title: 'Guided Setup',
    subtitle: 'Choose your industry and the jobs you want to automate.',
    points: [
      'Business types: Real Estate, Clinic, Shop, Farmer, etc.',
      'Select multiple use cases at once',
      'One tailored workflow created per use case',
    ],
    Visual: GuidedSetupVisual,
  },
  {
    step: 4,
    icon: Workflow,
    title: 'Workflow Builder',
    subtitle: 'Design automation with drag-and-drop nodes.',
    points: [
      'Trigger on every message or keywords',
      'Ask & Wait for multi-step data collection',
      'AI, Send Message, API, and Condition nodes',
    ],
    Visual: BuilderVisual,
  },
  {
    step: 5,
    icon: Zap,
    title: 'Publish & Run',
    subtitle: 'Go live with multiple workflows for one business.',
    points: [
      'Keyword routing between use-case workflows',
      'Pause or unpublish any workflow instantly',
      'Switch business after pausing all live flows',
    ],
    Visual: AutomateVisual,
  },
  {
    step: 6,
    icon: Inbox,
    title: 'Inbox & Analytics',
    subtitle: 'Monitor conversations and workflow performance.',
    points: [
      'Unified WhatsApp inbox with unread counts',
      'Execution logs for every workflow run',
      'Dashboard with contacts and activity',
    ],
    Visual: InboxVisual,
  },
];

function Mockup({ children, className = '' }) {
  return <div className={`auth-mockup p-4 ${className}`}>{children}</div>;
}

function OverviewVisual() {
  return (
    <Mockup>
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 flex-col items-center rounded-lg bg-white/5 py-4 ring-1 ring-white/10">
          <Smartphone size={28} strokeWidth={1.5} className="text-emerald-200/90" />
          <span className="mt-2 text-[11px] font-medium text-white/70">Customer</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-1">
          <div className="h-px w-10 bg-white/25" />
          <span className="text-[9px] uppercase tracking-wider text-white/40">Message</span>
        </div>
        <div className="flex flex-1 flex-col items-center rounded-lg bg-emerald-500/20 py-4 ring-1 ring-emerald-400/25">
          <Bot size={28} strokeWidth={1.5} className="text-emerald-100" />
          <span className="mt-2 text-[11px] font-medium text-white/80">AutoWave</span>
        </div>
      </div>
    </Mockup>
  );
}

function ConnectVisual() {
  return (
    <Mockup>
      <p className="mb-3 flex items-center gap-2 text-xs font-medium text-white/80">
        <Settings size={14} strokeWidth={1.5} />
        Settings → WhatsApp
      </p>
      <div className="space-y-2">
        {['Phone Number ID', 'Access Token', 'Webhook Verify Token'].map((label) => (
          <div key={label} className="flex items-center justify-between rounded-md bg-black/20 px-3 py-2">
            <span className="text-[11px] text-white/60">{label}</span>
            <span className="font-mono text-[10px] text-emerald-300/80">••••••</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-md bg-emerald-500/15 px-3 py-2 ring-1 ring-emerald-400/20">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="text-[11px] font-medium text-emerald-100">Connected</span>
      </div>
    </Mockup>
  );
}

function GuidedSetupVisual() {
  return (
    <Mockup className="space-y-3">
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/45">Business</p>
        <div className="grid grid-cols-2 gap-1.5">
          {['Real Estate', 'Clinic', 'Farmer', 'Local Shop'].map((b, i) => (
            <div
              key={b}
              className={`rounded-md px-2 py-1.5 text-center text-[10px] ${
                i === 2 ? 'bg-emerald-500/25 font-medium text-white ring-1 ring-emerald-400/30' : 'bg-white/5 text-white/60'
              }`}
            >
              {b}
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/45">Use cases</p>
        <div className="flex flex-wrap gap-1.5">
          {['Lead Gen', 'Support', 'Booking'].map((u) => (
            <span key={u} className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] text-white/75 ring-1 ring-white/10">
              {u}
            </span>
          ))}
        </div>
      </div>
    </Mockup>
  );
}

function BuilderVisual() {
  const nodes = [
    { label: 'Trigger', bg: 'bg-blue-500/80' },
    { label: 'Ask', bg: 'bg-cyan-500/80' },
    { label: 'AI', bg: 'bg-violet-500/80' },
    { label: 'Send', bg: 'bg-emerald-500/80' },
  ];
  return (
    <Mockup>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-white/45">Workflow canvas</p>
      <div className="flex items-center justify-between gap-2">
        {nodes.map((n, i) => (
          <div key={n.label} className="flex flex-1 items-center gap-2">
            <div className={`flex h-9 flex-1 items-center justify-center rounded-md ${n.bg} text-[9px] font-semibold text-white`}>
              {n.label}
            </div>
            {i < nodes.length - 1 && <div className="h-px w-2 shrink-0 bg-white/20" />}
          </div>
        ))}
      </div>
    </Mockup>
  );
}

function AutomateVisual() {
  const rows = [
    { name: 'Lead Generation', status: 'Live', on: true },
    { name: 'Customer Support', status: 'Live', on: true },
    { name: 'AI Chat', status: 'Paused', on: false },
  ];
  return (
    <Mockup>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-white/45">Published workflows</p>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center justify-between rounded-md bg-black/20 px-3 py-2">
            <span className="text-[11px] text-white/80">{r.name}</span>
            <span className={`text-[10px] font-medium ${r.on ? 'text-emerald-300' : 'text-white/40'}`}>{r.status}</span>
          </div>
        ))}
      </div>
    </Mockup>
  );
}

function InboxVisual() {
  return (
    <Mockup>
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Inbox, label: 'Inbox', value: '12' },
          { icon: Users, label: 'Contacts', value: '48' },
          { icon: BarChart3, label: 'Active', value: '3' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-md bg-white/5 py-3 text-center ring-1 ring-white/8">
            <Icon size={16} className="mx-auto text-white/50" strokeWidth={1.5} />
            <p className="mt-1 text-sm font-semibold tabular-nums">{value}</p>
            <p className="text-[9px] text-white/45">{label}</p>
          </div>
        ))}
      </div>
    </Mockup>
  );
}

function SlidePanel({ slide, isActive }) {
  const Icon = slide.icon;
  const Visual = slide.Visual;

  return (
    <div className={`auth-slide-panel flex h-full w-full shrink-0 flex-col justify-center px-1 ${isActive ? 'is-active' : ''}`}>
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-7 min-w-[1.75rem] items-center justify-center rounded-md bg-white/10 px-2 text-[11px] font-semibold tabular-nums text-white/70">
          {slide.step}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-300/80">of {SLIDES.length}</span>
      </div>

      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
        <Icon size={22} strokeWidth={1.5} className="text-white/90" />
      </div>

      <h2 className="text-2xl font-semibold leading-snug tracking-tight text-white xl:text-[1.65rem]">{slide.title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-white/60">{slide.subtitle}</p>

      <div className="my-5">
        <Visual />
      </div>

      <ul className="space-y-2.5">
        {slide.points.map((point) => (
          <li key={point} className="flex items-start gap-2.5 text-[13px] leading-snug text-white/75">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-400/90" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AuthShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const total = SLIDES.length;

  const goTo = useCallback(
    (index) => {
      setActive(((index % total) + total) % total);
      setProgress(0);
    },
    [total],
  );

  useEffect(() => {
    if (paused) return undefined;
    const tick = 50;
    const increment = (tick / SLIDE_INTERVAL_MS) * 100;
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p + increment >= 100) {
          setActive((a) => (a + 1) % total);
          return 0;
        }
        return p + increment;
      });
    }, tick);
    return () => clearInterval(timer);
  }, [paused, total]);

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden bg-[#0c3d2e] text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0a3328] via-[#0c3d2e] to-[#0f4a3a]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[45%] w-[55%] bg-gradient-to-tl from-emerald-500/10 to-transparent" />

      <div className="relative z-10 flex h-full flex-col px-8 py-7 lg:px-10 lg:py-8">
        <header className="flex shrink-0 items-center justify-between">
          <div>
            <AutoWaveLogoDark className="h-10 object-contain sm:h-11" />
            <p className="mt-1 text-[11px] text-white/45">Product overview</p>
          </div>
        </header>

        <div className="mt-5 flex shrink-0 gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/15"
              aria-label={`Go to slide ${i + 1}`}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-emerald-400/90 transition-all duration-150"
                style={{ width: i < active ? '100%' : i === active ? `${progress}%` : '0%' }}
              />
            </button>
          ))}
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden py-6">
          <div className="auth-slider-track flex h-full" style={{ transform: `translateX(-${active * 100}%)` }}>
            {SLIDES.map((slide, i) => (
              <SlidePanel key={slide.step} slide={slide} isActive={i === active} />
            ))}
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-between border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            className="auth-nav-btn flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5"
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>

          <p className="text-center text-[11px] text-white/40">
            {SLIDES[active].title}
            {paused && <span className="text-white/25"> · paused</span>}
          </p>

          <button
            type="button"
            onClick={() => goTo(active + 1)}
            className="auth-nav-btn flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5"
            aria-label="Next slide"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </footer>
      </div>
    </div>
  );
}
