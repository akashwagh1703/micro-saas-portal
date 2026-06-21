import { CheckCircle } from 'lucide-react';

/**
 * MessageTypeSelector Component
 * Provides visual selection of message type with descriptions
 * Enhanced with animations and accessibility improvements
 */
export default function MessageTypeSelector({ value, onChange }) {
  const types = [
    {
      id: 'QUICK_REPLY',
      name: 'Quick Reply',
      icon: '🔘',
      description: 'Up to 3 button options for quick responses',
      maxOptions: 3,
      useCases: ['Yes/No questions', 'Time slot selection', 'Confirmation prompts'],
      bestFor: 'Simple choices',
    },
    {
      id: 'LIST_MESSAGE',
      name: 'List Message',
      icon: '📋',
      description: 'Dropdown list with up to 10 options',
      maxOptions: 10,
      useCases: ['Product catalogs', 'Service menus', 'Multi-option selection'],
      bestFor: 'Detailed choices',
    },
    {
      id: 'FLOW_BUTTON',
      name: 'Flow Button',
      icon: '🔗',
      description: 'Single action button linking to external URL or flow',
      maxOptions: 1,
      useCases: ['External links', 'Call-to-action buttons', 'Flow starters'],
      bestFor: 'Direct actions',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-slate-900 block mb-3">
          Message Type
        </label>
        <p className="text-xs text-slate-600 mb-4 transition-all duration-200">
          Choose how you want to present options to users
        </p>
      </div>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
        {types.map((type, idx) => (
          <button
            key={type.id}
            onClick={() => onChange(type.id)}
            role="radio"
            aria-checked={value === type.id}
            aria-label={`${type.name}: ${type.description}`}
            className={`relative rounded-lg border-2 p-4 text-left transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-2 ${
              value === type.id
                ? 'border-emerald-500 bg-emerald-50 shadow-lg ring-2 ring-emerald-200 scale-105'
                : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md hover:scale-102'
            } focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`}
            style={{ animationDelay: `${idx * 50}ms` }}
            tabIndex={value === type.id ? 0 : -1}
          >
            {/* Selected Indicator */}
            {value === type.id && (
              <div className="absolute top-2 right-2 animate-in zoom-in-50 spin duration-300">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
            )}

            {/* Icon & Name */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl transition-transform duration-300 hover:scale-110">{type.icon}</span>
              <h4 className="font-semibold text-slate-900 transition-colors duration-200">{type.name}</h4>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 mb-3 line-clamp-2 transition-all duration-200">
              {type.description}
            </p>

            {/* Max Options Badge */}
            <div className="inline-block rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 mb-3 transition-all duration-200 group-hover:bg-slate-200">
              Max {type.maxOptions} option{type.maxOptions !== 1 ? 's' : ''}
            </div>

            {/* Use Cases */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-700">Use cases:</p>
              <ul className="text-xs text-slate-600 space-y-1">
                {type.useCases.map((useCase, ucIdx) => (
                  <li key={ucIdx} className="flex items-start gap-1.5 transition-all duration-150 hover:translate-x-1">
                    <span className="text-emerald-600 mt-1" aria-hidden="true">✓</span>
                    <span>{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Best For */}
            <div className="mt-3 pt-3 border-t border-slate-200 transition-all duration-200">
              <p className="text-xs">
                <span className="font-semibold text-slate-700">Best for: </span>
                <span className="text-slate-600">{type.bestFor}</span>
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <p className="text-xs text-amber-700">
          <span className="font-semibold">Tip:</span> Changing the type will clear
          existing options. Choose your type first, then add options.
        </p>
      </div>
    </div>
  );
}
