import { AutoWaveMark } from '../brand/AutoWaveBrand';
import { AUTH_TRUST_LINE, HOW_IT_WORKS } from './portalFeatures';
import AuthPhoneDemo from './AuthPhoneDemo';

export default function AuthShowcase() {
  const TrustIcon = AUTH_TRUST_LINE.icon;

  return (
    <div className="auth-showcase relative flex h-full flex-col overflow-hidden bg-white text-slate-900">
      <div className="relative z-10 flex h-full min-h-0 flex-col px-6 py-5 lg:px-8 lg:py-6 xl:px-10">
        <header className="flex shrink-0 items-center justify-between gap-3">
          <AutoWaveMark showTagline />
          <p className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] text-emerald-800 ring-1 ring-emerald-100 sm:inline-flex">
            <TrustIcon size={11} className="shrink-0 text-emerald-600" />
            <span className="truncate">{AUTH_TRUST_LINE.text}</span>
          </p>
        </header>

        <div className="mt-4 shrink-0 text-center lg:text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
            See it in action
          </p>
          <h1 className="mt-1 text-lg font-bold leading-tight tracking-tight text-slate-900 lg:text-xl xl:text-2xl">
            Customers message you — AutoWave replies instantly
          </h1>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center py-3">
          <AuthPhoneDemo />
        </div>

        <footer className="shrink-0 border-t border-slate-100 pt-3">
          <div className="grid grid-cols-3 gap-2">
            {HOW_IT_WORKS.map(({ step, title, line }) => (
              <div
                key={step}
                className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-2 ring-1 ring-slate-100"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-[10px] font-bold text-white">
                  {step}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold text-slate-800">{title}</p>
                  <p className="truncate text-[9px] text-slate-500">{line}</p>
                </div>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
