import AuthShowcase from '../auth/AuthShowcase';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="auth-shell">
      <AuthShowcase />

      <section className="auth-panel-signin" aria-label="Sign in">
        <div className="auth-signin-glow pointer-events-none" aria-hidden />

        <div className="auth-signin-inner">
          <div className="auth-form-panel">
            <header className="auth-form-header">
              <p className="auth-form-eyebrow">Operator access</p>
              <h2 className="auth-form-title">{title}</h2>
              {subtitle && <p className="auth-form-subtitle">{subtitle}</p>}
            </header>

            <div className="auth-animate-fade-up">{children}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
