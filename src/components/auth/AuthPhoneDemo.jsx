/** Animated WhatsApp phone — lead generation auto-reply demo. */
export default function AuthPhoneDemo() {
  return (
    <div className="auth-phone-scene">
      <div className="auth-phone-glow pointer-events-none" aria-hidden />

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
            <p className="truncate font-semibold text-white">Sunrise Realty</p>
            <p className="truncate">Lead generation · AutoWave</p>
          </div>
        </div>

        <div className="auth-wa-chat">
          <div className="auth-wa-chat-bg" aria-hidden />

          <p className="auth-wa-usecase">Lead gen bot</p>

          <div className="auth-chat-stack">
            <div className="auth-chat-msg auth-chat-in-1 auth-chat-incoming">
              <span>Hi! Interested in 2BHK flats.</span>
            </div>

            <div className="auth-chat-msg auth-chat-typing auth-chat-typing-1">
              <span className="auth-typing-dots">
                <i /><i /><i />
              </span>
            </div>

            <div className="auth-chat-msg auth-chat-out-1 auth-chat-outgoing">
              <span>Share your name, phone &amp; budget?</span>
            </div>

            <div className="auth-chat-msg auth-chat-in-2 auth-chat-incoming">
              <span>Rahul · 9876543210 · 80L</span>
            </div>

            <div className="auth-chat-msg auth-chat-typing auth-chat-typing-2">
              <span className="auth-typing-dots">
                <i /><i /><i />
              </span>
            </div>

            <div className="auth-chat-msg auth-chat-out-2 auth-chat-outgoing">
              <span>Lead saved! Our team will call you.</span>
            </div>

            <p className="auth-chat-badge auth-auto-badge">
              <span className="auth-auto-dot" />
              Lead captured
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
