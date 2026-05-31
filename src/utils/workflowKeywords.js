/** Plain-English summary of when an auto-reply triggers. */

export function getTriggerKeywords(definition) {
  const nodes = definition?.nodes || [];
  const trigger = nodes.find((n) => n.type === 'trigger');
  const raw = trigger?.data?.keywords ?? '';
  const list = (Array.isArray(raw) ? raw : String(raw).split(','))
    .map((k) => k.trim())
    .filter(Boolean);
  return list;
}

export function getTriggerChannel(definition) {
  const trigger = definition?.nodes?.find((n) => n.type === 'trigger');
  const channel = trigger?.data?.channel;
  if (channel === 'instagram' || channel === 'whatsapp') return channel;
  return 'both';
}

export function getChannelBadge(definition) {
  const channel = getTriggerChannel(definition);
  if (channel === 'instagram') {
    return { label: 'Instagram', className: 'bg-pink-100 text-pink-700' };
  }
  if (channel === 'whatsapp') {
    return { label: 'WhatsApp', className: 'bg-emerald-100 text-emerald-700' };
  }
  return { label: 'WhatsApp + IG', className: 'bg-violet-100 text-violet-700' };
}

export function describeTrigger(definition) {
  const channel = getTriggerChannel(definition);
  const keywords = getTriggerKeywords(definition);

  if (keywords.length === 0) {
    if (channel === 'instagram') return 'Replies to any Instagram DM';
    if (channel === 'whatsapp') return 'Replies to any WhatsApp message';
    return 'Replies to any message (WhatsApp or Instagram)';
  }

  const prefix =
    channel === 'instagram'
      ? 'Replies on Instagram when customer says'
      : channel === 'whatsapp'
        ? 'Replies on WhatsApp when customer says'
        : 'Replies when customer says';

  return `${prefix}: ${keywords.slice(0, 5).join(', ')}${keywords.length > 5 ? '…' : ''}`;
}
