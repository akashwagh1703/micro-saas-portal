import AuthShowcase from '../auth/AuthShowcase';
import AuthPhoneDemo from '../auth/AuthPhoneDemo';
import { AutoWaveMark } from '../brand/AutoWaveBrand';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="auth-shell flex flex-col lg:flex-row">
      {/* Desktop — white left panel */}
      <div className="hidden h-full w-[52%] shrink-0 bg-white xl:w-[54%] lg:block">
        <AuthShowcase />
      </div>

      {/* Mobile — white strip with phone demo */}
      <div className="auth-mobile-showcase shrink-0 bg-white lg:hidden">
        <AutoWaveMark showTagline className="w-full max-w-[280px]" />
        <p className="mt-2 text-center text-xs font-semibold text-emerald-600">
          Lead generation on WhatsApp
        </p>
        <AuthPhoneDemo compact />
      </div>

      {/* Form panel — sidebar colors */}
      <div className="auth-sidebar-bg relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-emerald-500/10 to-transparent lg:h-32" />

        <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <div className="w-full max-w-[400px]">
            <div className="auth-form-panel rounded-2xl border border-white/10 bg-white p-4 shadow-2xl shadow-black/30 sm:p-6">
              <div className="mb-3 hidden lg:block">
                <AutoWaveMark showTagline />
              </div>

              <div className="mb-3 lg:mb-5">
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
