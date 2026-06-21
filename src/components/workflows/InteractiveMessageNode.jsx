import { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings } from 'lucide-react';
import api from '../../services/api';

export default function InteractiveMessageNode({ data, isConnecting, selected, id, onNodeClick }) {
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
  const optionRouting = data.optionRouting || {};

  return (
    <div
      className={`relative min-w-[220px] rounded-lg border-2 bg-white shadow transition-all ${
        selected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'
      } ${!isConfigured && 'border-dashed'} hover:shadow-md`}
      onClick={onNodeClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onNodeClick?.()}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />

      {/* Header */}
      <div className={`rounded-t-md px-3 py-1.5 text-xs font-semibold text-white flex items-center justify-between ${
        template ? typeColor[template.messageType] : 'bg-slate-400'
      }`}>
        <span>
          {template
            ? `${typeEmoji[template.messageType]} ${template.messageType.replace(/_/g, ' ')}`
            : '⚙️ Interactive Message'}
        </span>
        {isConfigured && (
          <button
            className="text-white hover:bg-white/20 rounded p-0.5 transition-colors"
            title="Edit node"
          >
            <Settings size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-3 py-2.5">
        {loading ? (
          <p className="text-xs text-slate-500">Loading template…</p>
        ) : isConfigured ? (
          <>
            <p className="truncate text-sm font-medium text-slate-900">{template.name}</p>
            <p className="mt-1 line-clamp-2 text-xs text-slate-600">{template.bodyText}</p>
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-500">
                {template.options?.length || 0} option{template.options?.length !== 1 ? 's' : ''}
              </span>
              {template.options?.length > 0 && Object.keys(optionRouting).length > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-xs text-slate-500">{Object.keys(optionRouting).length} routed</span>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="text-xs font-medium text-slate-600">Not configured</p>
            <p className="mt-1 text-xs text-slate-500">Click to select template</p>
          </>
        )}
      </div>

      {/* Option Handles with Routing Indicator */}
      {isConfigured && template.options && template.options.length > 0 && (
        <div className="relative border-t border-slate-200 pt-2.5 pb-1 px-3">
          {template.options.slice(0, 4).map((option, idx) => {
            const totalOptions = Math.min(template.options.length, 4);
            const positions = {
              1: { position: '50%', left: '50%' },
              2: { position: idx === 0 ? '33%' : '67%', left: idx === 0 ? '33%' : '67%' },
              3: { position: idx === 0 ? '25%' : idx === 1 ? '50%' : '75%', left: idx === 0 ? '25%' : idx === 1 ? '50%' : '75%' },
              4: { position: idx === 0 ? '20%' : idx === 1 ? '40%' : idx === 2 ? '60%' : '80%', left: idx === 0 ? '20%' : idx === 1 ? '40%' : idx === 2 ? '60%' : '80%' },
            };

            const pos = positions[totalOptions];
            const hasRouting = optionRouting[option.id];

            return (
              <div key={`handle-${option.id}`} className="relative">
                {/* Routing Indicator */}
                {hasRouting && (
                  <div className="absolute -top-0.5 flex items-center justify-center" style={{ left: pos.left, transform: 'translateX(-50%)' }}>
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 border border-white" title={`Routes to node: ${optionRouting[option.id]}`} />
                  </div>
                )}

                {/* Option Label */}
                <span
                  className={`pointer-events-none absolute text-[9px] font-semibold whitespace-nowrap ${
                    hasRouting ? 'text-blue-600' : 'text-slate-600'
                  }`}
                  style={{ bottom: '-18px', left: pos.left, transform: 'translateX(-50%)' }}
                >
                  {option.optionText.substring(0, 12)}
                </span>

                {/* Handle */}
                <Handle
                  id={`option-${option.id}`}
                  type="source"
                  position={Position.Bottom}
                  style={{ left: pos.position }}
                  className={`!bg-slate-400 ${hasRouting ? '!bg-blue-500' : ''}`}
                />
              </div>
            );
          })}

          {/* Show more indicator */}
          {template.options.length > 4 && (
            <span className="pointer-events-none absolute text-[8px] font-semibold text-slate-500 right-1" style={{ bottom: '-18px' }}>
              +{template.options.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Single default handle if not configured */}
      {!isConfigured && (
        <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
      )}
    </div>
  );
}
