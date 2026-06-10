/** Animated WhatsApp phone — lead generation auto-reply demo. */
export default function AuthPhoneDemo({ compact = false }) {
  return (
    <div className={`auth-phone-scene ${compact ? 'auth-phone-scene--compact' : ''}`}>
      <div className="auth-phone-glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="auth-phone">
        <div className="auth-phone-notch" aria-hidden />

        {!compact && (
          <div className="auth-phone-status">
            <span>9:41</span>
            <div className="auth-phone-status-icons" aria-hidden>
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        <div className="auth-wa-header">
          <div className="auth-wa-back" aria-hidden />
          <div className="auth-wa-avatar">SR</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-white">Sunrise Realty</p>
            <p className="truncate text-[9px] text-emerald-100/80">Lead generation · AutoWave</p>
          </div>
        </div>

        <div className="auth-wa-chat">
          <div className="auth-wa-chat-bg" aria-hidden />

          {!compact && (
            <p className="auth-wa-usecase">Lead generation auto-reply</p>
          )}

          <div className="auth-chat-stack">
            <div className="auth-chat-msg auth-chat-in-1 auth-chat-incoming">
              <span>Hi! Interested in 2BHK flats.</span>
              {!compact && <time>10:02</time>}
            </div>

            {!compact && (
              <div className="auth-chat-msg auth-chat-typing auth-chat-typing-1">
                <span className="auth-typing-dots">
                  <i /><i /><i />
                </span>
              </div>
            )}

            <div className="auth-chat-msg auth-chat-out-1 auth-chat-outgoing">
              <span>{compact ? 'Share name, phone & budget?' : 'Happy to help! Share your name, phone & budget.'}</span>
              {!compact && <time>10:02</time>}
            </div>

            <div className="auth-chat-msg auth-chat-in-2 auth-chat-incoming">
              <span>Rahul · 9876543210 · 80L</span>
              {!compact && <time>10:03</time>}
            </div>

            {!compact && (
              <div className="auth-chat-msg auth-chat-typing auth-chat-typing-2">
                <span className="auth-typing-dots">
                  <i /><i /><i />
                </span>
              </div>
            )}

            <div className="auth-chat-msg auth-chat-out-2 auth-chat-outgoing">
              <span>{compact ? 'Lead saved! We\'ll call you.' : 'Thanks Rahul! Lead saved — our team will call you today.'}</span>
              {!compact && <time>10:03</time>}
            </div>

            <p className="auth-chat-badge auth-auto-badge">
              <span className="auth-auto-dot" />
              {compact ? 'Lead captured' : 'Lead captured · saved to dashboard'}
            </p>
          </div>
        </div>

        <div className="auth-wa-input" aria-hidden>
          <span>Message</span>
          <div className="auth-wa-send" />
        </div>
      </div>
    </div>
  );
}
