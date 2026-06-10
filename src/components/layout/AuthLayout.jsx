import AuthShowcase from '../auth/AuthShowcase';
import AuthPhoneDemo from '../auth/AuthPhoneDemo';
import { AutoWaveMark } from '../brand/AutoWaveBrand';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="auth-shell">
      {/* Desktop — white left panel */}
      <div className="auth-desktop-showcase hidden h-full bg-white lg:block">
        <AuthShowcase />
      </div>

      {/* Mobile / tablet — compact top strip */}
      <div className="auth-mobile-showcase bg-white lg:hidden">
        <div className="auth-mobile-copy">
          <AutoWaveMark showTagline />
          <p className="mt-1.5 text-xs font-semibold leading-snug text-emerald-600">
            Lead generation on WhatsApp
          </p>
          <p className="mt-0.5 hidden text-[10px] leading-snug text-slate-500 sm:block">
            Auto-replies collect name, phone &amp; budget — saved as leads.
          </p>
        </div>
        <div className="auth-mobile-phone">
          <AuthPhoneDemo compact />
        </div>
      </div>

      {/* Form panel — sidebar colors */}
      <div className="auth-sidebar-bg relative flex min-h-0 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-emerald-500/10 to-transparent lg:h-32" />

        <div className="auth-form-wrap relative flex min-h-0 flex-1 flex-col justify-center px-4 py-3 sm:px-6 lg:px-8 lg:py-6">
          <div className="mx-auto w-full max-w-[400px]">
            <div className="auth-form-panel rounded-2xl border border-white/10 bg-white p-4 shadow-2xl shadow-black/30 sm:p-5 lg:p-6">
              <div className="mb-3 hidden lg:block">
                <AutoWaveMark showTagline />
              </div>

              <div className="mb-3 lg:mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600">
                  Sign in
                </p>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{subtitle}</p>
                )}
              </div>

              <div className="auth-animate-fade-up">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
