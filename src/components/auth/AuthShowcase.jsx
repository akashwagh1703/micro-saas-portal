import { AutoWaveMark } from '../brand/AutoWaveBrand';
import { AUTH_TRUST_LINE, HOW_IT_WORKS } from './portalFeatures';
import AuthPhoneDemo from './AuthPhoneDemo';

export default function AuthShowcase() {
  const TrustIcon = AUTH_TRUST_LINE.icon;

  return (
    <section className="auth-panel-brand" aria-label="AutoWave product preview">
      <div className="auth-brand-inner">
        <header className="auth-brand-header">
          <AutoWaveMark showTagline />
          <p className="auth-brand-trust">
            <TrustIcon size={12} className="shrink-0 text-emerald-600" />
            <span>{AUTH_TRUST_LINE.text}</span>
          </p>
        </header>

        <div className="auth-brand-hero">
          <p className="auth-brand-eyebrow">Lead generation on WhatsApp</p>
          <h1 className="auth-brand-title">
            Capture leads automatically — while you focus on your business
          </h1>
          <p className="auth-brand-desc auth-brand-desc--desktop">
            AutoWave replies, collects name &amp; budget, and saves every lead to your dashboard.
          </p>
        </div>

        <div className="auth-brand-phone">
          <AuthPhoneDemo />
        </div>

        <footer className="auth-brand-steps">
          {HOW_IT_WORKS.map(({ step, title, line }) => (
            <div key={step} className="auth-brand-step">
              <span className="auth-brand-step-num">{step}</span>
              <div>
                <p className="auth-brand-step-title">{title}</p>
                <p className="auth-brand-step-line">{line}</p>
              </div>
            </div>
          ))}
        </footer>
      </div>
    </section>
  );
}
