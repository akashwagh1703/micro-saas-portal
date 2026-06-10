/** Animated WhatsApp phone — looping customer ↔ auto-reply chat. */
export default function AuthPhoneDemo() {
  return (
    <div className="auth-phone-scene">
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
          <div className="auth-wa-avatar">AW</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-white">Your Business</p>
            <p className="text-[9px] text-emerald-100/80">AutoWave · online</p>
          </div>
        </div>

        <div className="auth-wa-chat">
          <div className="auth-wa-chat-bg" aria-hidden />

          <div className="auth-chat-msg auth-chat-in-1 auth-chat-incoming">
            <span>Hi, are you open today?</span>
            <time>10:02</time>
          </div>

          <div className="auth-chat-msg auth-chat-typing auth-chat-typing-1">
            <span className="auth-typing-dots">
              <i /><i /><i />
            </span>
          </div>

          <div className="auth-chat-msg auth-chat-out-1 auth-chat-outgoing">
            <span>Yes! We&apos;re open until 8 PM. How can we help?</span>
            <time>10:02</time>
          </div>

          <div className="auth-chat-msg auth-chat-in-2 auth-chat-incoming">
            <span>Do you deliver nearby?</span>
            <time>10:03</time>
          </div>

          <div className="auth-chat-msg auth-chat-typing auth-chat-typing-2">
            <span className="auth-typing-dots">
              <i /><i /><i />
            </span>
          </div>

          <div className="auth-chat-msg auth-chat-out-2 auth-chat-outgoing">
            <span>Yes — delivery is available in your area. Shall I note your address?</span>
            <time>10:03</time>
          </div>

          <p className="auth-chat-badge auth-auto-badge">
            <span className="auth-auto-dot" />
            Auto-replied by AutoWave
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
