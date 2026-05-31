/** Shared contact labels for Inbox, Contacts, and Leads. */

export function contactPrimaryLabel(contact) {
  if (!contact) return '?';
  if (contact.name) return contact.name;
  if (contact.username) {
    return contact.username.startsWith('@') ? contact.username : `@${contact.username}`;
  }
  return contact.phone || '?';
}

export function contactSecondaryLabel(contact) {
  if (!contact) return '';
  if (contact.channel === 'instagram') {
    return contact.username
      ? `@${contact.username.replace(/^@/, '')}`
      : 'Instagram DM';
  }
  return contact.phone || '';
}

export function contactReachLabel(contact) {
  if (!contact) return '—';
  if (contact.channel === 'instagram') {
    return contact.username ? `@${contact.username.replace(/^@/, '')}` : 'Instagram DM';
  }
  return contact.phone || '—';
}

export function channelBadgeClass(channel) {
  if (channel === 'instagram') return 'bg-pink-100 text-pink-700';
  return 'bg-emerald-100 text-emerald-700';
}

export function channelBadgeLabel(channel) {
  if (channel === 'instagram') return 'Instagram';
  if (channel === 'whatsapp') return 'WhatsApp';
  return channel || '—';
}
