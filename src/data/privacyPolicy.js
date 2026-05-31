/** Privacy policy shown on the portal (login/register). Keep aligned with micro-saas-website legal.js */

export const privacyPolicy = {
  title: 'Privacy Policy',
  updated: 'May 30, 2026',
  intro:
    'WhatsFlow ("we", "us", "our") operates the WhatsFlow platform and customer portal (the "Service"). This Privacy Policy explains how we collect, use, store, and protect your information when you use our Service. By registering or using WhatsFlow, you agree to this policy.',
  contactEmail: 'hello@whatsflow.in',
  sections: [
    {
      id: 'who-we-are',
      title: '1. Who we are',
      paragraphs: [
        'WhatsFlow is a software platform that helps small businesses automate customer conversations on WhatsApp and Instagram using auto-reply workflows, a unified inbox, contact management, and lead capture.',
        'For privacy-related questions, contact us at hello@whatsflow.in.',
      ],
    },
    {
      id: 'information-we-collect',
      title: '2. Information we collect',
      paragraphs: ['We collect information necessary to provide the Service:'],
      list: [
        'Account information: name, email address, and password (stored as a secure hash).',
        'Business profile: industry category and use cases you select during setup.',
        'WhatsApp configuration: access tokens, phone number IDs, verify tokens, and app secrets you provide to connect Meta WhatsApp Cloud API. These are encrypted at rest.',
        'Instagram configuration: Page access tokens, Page ID, verify tokens, app secrets, and linked Instagram business account metadata. These are encrypted at rest.',
        'Message data: incoming and outgoing message content across WhatsApp and Instagram, timestamps, contact identifiers (phone numbers, Instagram usernames), and conversation metadata.',
        'Lead data: information captured through auto-reply workflows (names, answers, channel source).',
        'Workflow data: auto-reply definitions, execution logs, and automation settings you create.',
        'Billing information: subscription status, trial dates, and Razorpay IDs when billing is enabled. Payment cards are handled by Razorpay — we do not store full card numbers.',
        'Technical data: IP address, browser type, and usage logs for security and troubleshooting.',
        'AI integration keys (optional): OpenRouter or OpenAI API keys you provide, encrypted at rest.',
      ],
    },
    {
      id: 'how-we-use',
      title: '3. How we use your information',
      paragraphs: ['We use collected information solely to operate and improve WhatsFlow:'],
      list: [
        'Authenticate your account and maintain your session.',
        'Connect to Meta APIs on your behalf to receive and send WhatsApp and Instagram messages.',
        'Execute auto-reply workflows when customers message you.',
        'Display your inbox, contacts, leads, and dashboard analytics.',
        'Process subscription payments and manage trial/billing status.',
        'Send service-related communications (e.g. trial expiry, payment confirmations).',
        'Detect abuse, fraud, and security incidents.',
        'Improve product features and fix bugs using aggregated data where possible.',
      ],
    },
    {
      id: 'legal-basis',
      title: '4. Legal basis & purpose limitation',
      paragraphs: [
        'We process your data based on: (a) performance of our contract with you; (b) your consent (e.g. connecting WhatsApp or Instagram); and (c) legitimate interests (security, fraud prevention, product improvement).',
        'We do not sell, rent, or trade your personal information or your customers\' contact lists to third parties for marketing purposes.',
      ],
    },
    {
      id: 'sharing',
      title: '5. How we share information',
      paragraphs: ['We share data only when necessary to run the Service:'],
      list: [
        'Meta (Facebook): Message delivery requires transmitting content and identifiers through Meta WhatsApp Cloud API and Instagram Messaging API under your configured credentials.',
        'Razorpay: Payment processing when you subscribe to a paid plan.',
        'Cloud infrastructure providers: encrypted database storage and application hosting.',
        'AI providers (OpenRouter/OpenAI): Only when you enable smart reply nodes with your own API keys.',
        'Legal requirements: If required by law, court order, or to protect rights, safety, and security.',
      ],
    },
    {
      id: 'retention',
      title: '6. Data retention',
      paragraphs: [
        'We retain your account data and message history while your account is active and as needed to provide the Service.',
        'If you delete your account or request deletion, we will remove or anonymize personal data within 30 days, except where retention is required by law.',
        'Encrypted backups may persist for up to 90 days before permanent deletion.',
      ],
    },
    {
      id: 'security',
      title: '7. Security measures',
      paragraphs: ['We implement safeguards including TLS/HTTPS in transit, AES-256-GCM encryption for Meta and AI credentials at rest, bcrypt password hashing, bearer token authentication, webhook signature verification, and per-account data isolation.'],
    },
    {
      id: 'your-rights',
      title: '8. Your rights',
      paragraphs: [
        'You may request access, correction, deletion, or export of your personal data by emailing hello@whatsflow.in from your registered email. We will respond within 30 days where applicable under law.',
      ],
    },
    {
      id: 'customer-data',
      title: '9. Your customers\' data',
      paragraphs: [
        'When you use WhatsFlow, you may process personal data of your customers (phone numbers, Instagram usernames, names, message content). You are the data controller; WhatsFlow acts as a data processor on your instructions.',
        'You must comply with Meta WhatsApp Business Policy, Instagram Platform Policy, and applicable privacy laws, including obtaining consent where required and honouring opt-out requests.',
      ],
    },
    {
      id: 'cookies',
      title: '10. Cookies & local storage',
      paragraphs: [
        'The portal uses local storage and session tokens to keep you logged in. We do not use third-party advertising cookies on the Service.',
      ],
    },
    {
      id: 'changes',
      title: '11. Changes to this policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time. We will post the revised policy with an updated date. Continued use of the Service after changes constitutes acceptance.',
      ],
    },
    {
      id: 'contact',
      title: '12. Contact us',
      paragraphs: ['For privacy questions or data requests: hello@whatsflow.in'],
    },
  ],
};
