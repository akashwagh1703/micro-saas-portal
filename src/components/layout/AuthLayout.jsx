import AuthShowcase from '../auth/AuthShowcase';
import AuthQuickHighlights from '../auth/AuthQuickHighlights';
import { AutoWaveMark } from '../brand/AutoWaveBrand';
import { AUTH_TRUST_LINE } from '../auth/portalFeatures';

export default function AuthLayout({ children, title, subtitle }) {
  const TrustIcon = AUTH_TRUST_LINE.icon;

  return (
    <div className="flex min-h-screen max-h-screen overflow-hidden bg-[#0a0f14] lg:bg-slate-950">
      <div className="hidden h-full w-[54%] shrink-0 xl:w-[56%] lg:block">
        <AuthShowcase />
      </div>

      <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,_rgb(16_185_129_/_0.14),_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,_rgb(99_102_241_/_0.1),_transparent_50%)]" />

        {/* Mobile: condensed product preview */}
        <div className="relative shrink-0 border-b border-white/5 bg-[#0d1218]/90 px-4 py-4 backdrop-blur-md lg:hidden">
          <AutoWaveMark variant="dark" showTagline />
          <p className="mt-3 text-lg font-bold leading-snug tracking-tight text-white">
            Reply instantly on WhatsApp &amp; Instagram
          </p>
          <p className="mt-1 text-xs text-white/45">One simple dashboard for your whole business</p>
          <AuthQuickHighlights compact className="mt-4" />
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-[440px]">
            <div className="auth-form-panel rounded-3xl border border-white/10 bg-white/[0.97] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
              <div className="mb-7">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                  Operator login
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem]">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{subtitle}</p>
                )}
              </div>

              <div className="auth-animate-fade-up">{children}</div>

              <div className="mt-7 hidden border-t border-slate-100 pt-6 lg:block">
                <AuthQuickHighlights />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
              <TrustIcon size={14} className="shrink-0 text-emerald-500/80" />
              <span>{AUTH_TRUST_LINE.text}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
