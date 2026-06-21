import { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import api from '../../services/api';

export default function InteractiveMessageNode({ data, isConnecting, selected }) {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data.templateId) {
      setLoading(true);
      api
        .get(`/interactive-messages/${data.templateId}`)
        .then((res) => {
          setTemplate(res.data);
        })
        .catch(() => {
          setTemplate(null);
        })
        .finally(() => setLoading(false));
    }
  }, [data.templateId]);

  const typeEmoji = {
    QUICK_REPLY: '🔘',
    LIST_MESSAGE: '📋',
    FLOW_BUTTON: '🔗',
  };

  const typeColor = {
    QUICK_REPLY: 'bg-emerald-500',
    LIST_MESSAGE: 'bg-blue-500',
    FLOW_BUTTON: 'bg-purple-500',
  };

  const isConfigured = data.templateId && template;

  return (
    <div
      className={`relative min-w-[200px] rounded-lg border-2 bg-white shadow ${
        selected ? 'border-emerald-500' : 'border-slate-200'
      } ${!isConfigured && 'border-dashed'}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />

      {/* Header */}
      <div className={`rounded-t-md px-3 py-1.5 text-xs font-semibold text-white ${
        template ? typeColor[template.messageType] : 'bg-slate-400'
      }`}>
        {template
          ? `${typeEmoji[template.messageType]} ${template.messageType.replace(/_/g, ' ')}`
          : '⚙️ Interactive Message'}
      </div>

      {/* Content */}
      <div className="px-3 py-2">
        {loading ? (
          <p className="text-xs text-slate-500">Loading template…</p>
        ) : isConfigured ? (
          <>
            <p className="truncate text-sm font-medium text-slate-900">{template.name}</p>
            <p className="mt-1 line-clamp-2 text-xs text-slate-600">{template.bodyText}</p>
            <div className="mt-2 flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-500">{template.options?.length || 0} option(s)</span>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs font-medium text-slate-600">Not configured</p>
            <p className="mt-1 text-xs text-slate-500">Select a template to get started</p>
          </>
        )}
      </div>

      {/* Handles for button options (if configured) */}
      {isConfigured && template.options && template.options.length > 0 && (
        <div className="relative border-t border-slate-200 pt-2 pb-1 px-3">
          {template.options.slice(0, 3).map((option, idx) => {
            const totalOptions = Math.min(template.options.length, 3);
            const positions = {
              1: { position: '50%', left: '50%' },
              2: { position: idx === 0 ? '33%' : '67%', left: idx === 0 ? '33%' : '67%' },
              3: { position: idx === 0 ? '25%' : idx === 1 ? '50%' : '75%', left: idx === 0 ? '25%' : idx === 1 ? '50%' : '75%' },
            };

            const pos = positions[totalOptions];

            return (
              <div key={`handle-${idx}`}>
                <span className="pointer-events-none absolute text-[9px] font-semibold text-slate-600 whitespace-nowrap" style={{ bottom: '-16px', left: pos.left, transform: 'translateX(-50%)' }}>
                  {option.optionText.substring(0, 10)}...
                </span>
                <Handle
                  id={`option-${idx}`}
                  type="source"
                  position={Position.Bottom}
                  style={{ left: pos.position }}
                  className="!bg-slate-400"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Single default handle if not configured */}
      {!isConfigured && (
        <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
      )}
    </div>
  );
}
