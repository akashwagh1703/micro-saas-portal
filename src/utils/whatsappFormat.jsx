/** Parse WhatsApp *bold*, _italic_, ~strike~ into React nodes. */
export function parseWhatsAppSegments(text) {
  const parts = String(text ?? '').split(/(\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(1, -1)}
        </strong>
      );
    }
    if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
      return (
        <em key={index} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('~') && part.endsWith('~') && part.length > 2) {
      return (
        <span key={index} className="line-through">
          {part.slice(1, -1)}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function WhatsAppMessageContent({ content }) {
  const lines = String(content ?? '').split('\n');
  return (
    <span className="whitespace-pre-wrap break-words">
      {lines.map((line, lineIndex) => (
        <span key={lineIndex}>
          {lineIndex > 0 ? <br /> : null}
          {parseWhatsAppSegments(line)}
        </span>
      ))}
    </span>
  );
}
