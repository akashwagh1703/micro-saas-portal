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

export function describeTrigger(definition) {
  const keywords = getTriggerKeywords(definition);
  if (keywords.length === 0) {
    return 'Replies to any WhatsApp message';
  }
  return `Replies when customer says: ${keywords.slice(0, 5).join(', ')}${keywords.length > 5 ? '…' : ''}`;
}
