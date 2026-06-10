/** Animated WhatsApp phone — lead generation auto-reply demo. */
export default function AuthPhoneDemo({ compact = false }) {
  return (
    <div className={`auth-phone-scene ${compact ? 'auth-phone-scene--compact' : ''}`}>
      <div className="auth-phone-glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="auth-phone">
        <div className="auth-phone-notch" aria-hidden />

        <div className="auth-phone-status">
          <span>9:41</span>
          <div className="auth-phone-status-icons" aria-hidden>
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="auth-wa-header">
          <div className="auth-wa-back" aria-hidden />
          <div className="auth-wa-avatar">SR</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-white">Sunrise Realty</p>
            <p className="text-[9px] text-emerald-100/80">Lead generation · AutoWave</p>
          </div>
        </div>

        <div className="auth-wa-chat">
          <div className="auth-wa-chat-bg" aria-hidden />

          <p className="auth-wa-usecase">Lead generation auto-reply</p>

          <div className="auth-chat-msg auth-chat-in-1 auth-chat-incoming">
            <span>Hi! I want details on your 2BHK flats.</span>
            <time>10:02</time>
          </div>

          <div className="auth-chat-msg auth-chat-typing auth-chat-typing-1">
            <span className="auth-typing-dots">
              <i /><i /><i />
            </span>
          </div>

          <div className="auth-chat-msg auth-chat-out-1 auth-chat-outgoing">
            <span>Happy to help! Please share your name, phone &amp; budget.</span>
            <time>10:02</time>
          </div>

          <div className="auth-chat-msg auth-chat-in-2 auth-chat-incoming">
            <span>Rahul · 9876543210 · budget 80L</span>
            <time>10:03</time>
          </div>

          <div className="auth-chat-msg auth-chat-typing auth-chat-typing-2">
            <span className="auth-typing-dots">
              <i /><i /><i />
            </span>
          </div>

          <div className="auth-chat-msg auth-chat-out-2 auth-chat-outgoing">
            <span>Thanks Rahul! Lead saved — our team will call you today.</span>
            <time>10:03</time>
          </div>

          <p className="auth-chat-badge auth-auto-badge">
            <span className="auth-auto-dot" />
            Lead captured · saved to dashboard
          </p>
        </div>

        <div className="auth-wa-input" aria-hidden>
          <span>Message</span>
          <div className="auth-wa-send" />
        </div>
      </div>
    </div>
  );
}
