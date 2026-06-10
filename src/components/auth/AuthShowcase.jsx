import { AutoWaveLogoDark } from '../brand/AutoWaveBrand';
import { AUTH_TRUST_LINE, HOW_IT_WORKS, PORTAL_HIGHLIGHTS } from './portalFeatures';

function FeatureCard({ item }) {
  const Icon = item.icon;

  return (
    <article className="auth-bento-card flex items-center gap-2.5 rounded-xl bg-emerald-500/10 p-2.5 ring-1 ring-emerald-400/15">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 ring-1 ring-emerald-400/20">
        <Icon size={16} strokeWidth={1.75} className="text-emerald-200" />
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-xs font-semibold text-white">{item.title}</h3>
        <p className="truncate text-[10px] text-emerald-100/50">{item.line}</p>
      </div>
    </article>
  );
}

export default function AuthShowcase() {
  const TrustIcon = AUTH_TRUST_LINE.icon;

  return (
    <div className="auth-showcase relative h-full overflow-hidden text-white">
      <div className="auth-showcase-bg pointer-events-none absolute inset-0" />
      <div className="auth-orb auth-orb-1 pointer-events-none absolute" />
      <div className="auth-orb auth-orb-2 pointer-events-none absolute" />
      <div className="auth-grain pointer-events-none absolute inset-0 opacity-[0.3]" />

      <div className="relative z-10 flex h-full flex-col gap-4 px-6 py-5 lg:px-8 lg:py-6 xl:px-10">
        <header className="flex shrink-0 items-center justify-between gap-3">
          <AutoWaveLogoDark className="h-8 object-contain sm:h-9" />
          <p className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] text-emerald-100/70 ring-1 ring-emerald-400/15 sm:inline-flex">
            <TrustIcon size={11} className="shrink-0 text-emerald-300" />
            <span className="truncate">{AUTH_TRUST_LINE.text}</span>
          </p>
        </header>

        <div className="shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
            All-in-one dashboard
          </p>
          <h1 className="mt-1.5 text-xl font-bold leading-tight tracking-tight lg:text-2xl xl:text-[1.65rem]">
            Reply to customers instantly
          </h1>
          <p className="mt-1.5 max-w-md text-xs leading-relaxed text-emerald-50/45">
            WhatsApp, Instagram, contacts, leads &amp; CareerAI — one easy place.
          </p>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 lg:grid-cols-3 lg:content-center xl:gap-2.5">
          {PORTAL_HIGHLIGHTS.map((item) => (
            <FeatureCard key={item.id} item={item} />
          ))}
        </div>

        <footer className="shrink-0 border-t border-emerald-400/10 pt-3">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-emerald-200/40">
            How it works
          </p>
          <div className="grid grid-cols-3 gap-2">
            {HOW_IT_WORKS.map(({ step, title, line }) => (
              <div
                key={step}
                className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-2 py-2 ring-1 ring-emerald-400/10"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/25 text-[10px] font-bold text-emerald-100">
                  {step}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold text-white/90">{title}</p>
                  <p className="truncate text-[9px] text-emerald-100/45">{line}</p>
                </div>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
