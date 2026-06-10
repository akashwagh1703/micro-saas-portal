import { AutoWaveLogoDark } from '../brand/AutoWaveBrand';
import { AUTH_TRUST_LINE, HOW_IT_WORKS, PORTAL_HIGHLIGHTS } from './portalFeatures';

function ChatPreview() {
  return (
    <div className="auth-chat-preview mt-4 space-y-2">
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/10 px-3 py-2 text-[11px] text-white/80 ring-1 ring-white/10">
          Hi, are you open today?
        </div>
      </div>
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-emerald-500/30 px-3 py-2 text-[11px] text-emerald-50 ring-1 ring-emerald-400/25">
          Yes! We&apos;re open until 8 PM. How can we help?
        </div>
      </div>
      <p className="pt-1 text-[10px] text-emerald-200/70">↳ Replied automatically for you</p>
    </div>
  );
}

function FeatureCard({ item }) {
  const Icon = item.icon;

  return (
    <article
      className={`auth-bento-card group relative overflow-hidden rounded-2xl bg-gradient-to-br p-4 ring-1 ${item.accent} ${item.span || ''}`}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5 blur-2xl transition group-hover:bg-white/10" />
      <div className="relative flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
          <Icon size={20} strokeWidth={1.75} className={item.iconClass} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white">{item.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-white/55">{item.line}</p>
        </div>
      </div>
      {item.featured && <ChatPreview />}
    </article>
  );
}

export default function AuthShowcase() {
  const TrustIcon = AUTH_TRUST_LINE.icon;

  return (
    <div className="auth-showcase relative flex h-full flex-col overflow-hidden text-white">
      <div className="auth-showcase-bg pointer-events-none absolute inset-0" />
      <div className="auth-orb auth-orb-1 pointer-events-none absolute" />
      <div className="auth-orb auth-orb-2 pointer-events-none absolute" />
      <div className="auth-orb auth-orb-3 pointer-events-none absolute" />
      <div className="auth-grain pointer-events-none absolute inset-0 opacity-[0.35]" />

      <div className="relative z-10 flex h-full flex-col px-8 py-8 lg:px-10 lg:py-10 xl:px-12">
        <header className="shrink-0">
          <AutoWaveLogoDark className="h-10 object-contain sm:h-11" />
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/50 ring-1 ring-white/10">
            <TrustIcon size={12} className="text-emerald-400" />
            {AUTH_TRUST_LINE.text}
          </p>
        </header>

        <div className="my-8 shrink-0 xl:my-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
            All-in-one dashboard
          </p>
          <h1 className="mt-3 max-w-xl text-3xl font-bold leading-[1.15] tracking-tight xl:text-[2.35rem]">
            Reply to customers instantly — even when you&apos;re busy
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/55">
            WhatsApp, Instagram, contacts, leads &amp; job seeker tools — everything in one calm, easy dashboard.
          </p>
        </div>

        <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:content-start lg:gap-3">
          {PORTAL_HIGHLIGHTS.map((item) => (
            <FeatureCard key={item.id} item={item} />
          ))}
        </div>

        <footer className="mt-6 shrink-0 border-t border-white/10 pt-6">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/40">
            How it works
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, line }) => (
              <div
                key={step}
                className="flex items-start gap-3 rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/8"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-xs font-bold text-emerald-200 ring-1 ring-emerald-400/20">
                  {step}
                </span>
                <div>
                  <p className="text-xs font-semibold text-white/90">{title}</p>
                  <p className="text-[11px] text-white/45">{line}</p>
                </div>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
