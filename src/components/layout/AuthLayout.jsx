import AuthShowcase from '../auth/AuthShowcase';
import { AutoWaveMark } from '../brand/AutoWaveBrand';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="auth-shell flex">
      <div className="hidden h-full w-[52%] shrink-0 bg-white xl:w-[54%] lg:block">
        <AuthShowcase />
      </div>

      <div className="auth-sidebar-bg relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-500/10 to-transparent" />

        <div className="relative flex shrink-0 justify-center px-4 pt-5 lg:hidden">
          <AutoWaveMark variant="dark" showTagline />
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-5 pt-3 lg:px-8 lg:py-6">
          <div className="w-full max-w-[400px]">
            <div className="auth-form-panel rounded-2xl border border-white/10 bg-white p-5 shadow-2xl shadow-black/30 sm:p-6">
              <div className="mb-4 hidden lg:block">
                <AutoWaveMark showTagline />
              </div>

              <div className="mb-4 lg:mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600">
                  Sign in
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">{title}</h2>
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
