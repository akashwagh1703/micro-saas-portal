import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * MessagePreview Component
 * Displays a real-time WhatsApp-style preview of the interactive message
 * Updates instantly as form values change
 * Enhanced with animations and accessibility
 */
export default function MessagePreview({ formData }) {
  const [expandedListIndex, setExpandedListIndex] = useState(0);
  const [hoveredOptionIndex, setHoveredOptionIndex] = useState(null);

  const messageType = formData.messageType || 'QUICK_REPLY';
  const headerText = formData.headerText?.trim() || '';
  const bodyText = formData.bodyText?.trim() || 'Message content...';
  const footerText = formData.footerText?.trim() || '';
  const options = formData.options || [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Message Preview</h3>
        <span className="text-xs font-medium text-slate-500 transition-all duration-200">
          {messageType === 'QUICK_REPLY' && '🔘 Quick Reply'}
          {messageType === 'LIST_MESSAGE' && '📋 List Message'}
          {messageType === 'FLOW_BUTTON' && '🔗 Flow Button'}
        </span>
      </div>

      {/* Phone Frame */}
      <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border-8 border-slate-900 bg-slate-900 shadow-lg transition-shadow duration-300 hover:shadow-xl">
        {/* Status Bar */}
        <div className="bg-slate-800 px-3 py-1.5 text-center text-[10px] font-semibold text-white">
          WhatsApp
        </div>

        {/* Chat Area */}
        <div className="space-y-2 bg-gradient-to-b from-slate-50 to-slate-100 p-3 min-h-64">
          {/* Message Bubble */}
          <div className="max-w-xs rounded-lg bg-white shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300 transition-all">
            {/* Header */}
            {headerText && (
              <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-3 py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-xs font-semibold text-slate-700">{headerText}</p>
              </div>
            )}

            {/* Body */}
            <div className="px-3 py-2.5">
              <p className="text-sm leading-relaxed text-slate-900">{bodyText}</p>
            </div>

            {/* Interactive Content */}
            {messageType === 'QUICK_REPLY' && options.length > 0 && (
              <div className="border-t border-slate-200 space-y-1.5 px-2 py-2 animate-in fade-in slide-in-from-bottom-2 duration-400">
                {options.slice(0, 3).map((opt, idx) => (
                  <button
                    key={idx}
                    role="option"
                    aria-selected="false"
                    onMouseEnter={() => setHoveredOptionIndex(idx)}
                    onMouseLeave={() => setHoveredOptionIndex(null)}
                    className={`w-full rounded-lg border border-emerald-300 px-2 py-1.5 text-xs font-medium text-emerald-700 transition-all duration-200 transform ${
                      hoveredOptionIndex === idx
                        ? 'bg-emerald-200 shadow-sm scale-102'
                        : 'bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200'
                    }`}
                    disabled
                    aria-label={`Option: ${opt.optionText || `Option ${idx + 1}`}`}
                  >
                    {opt.optionText || `Option ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}

            {messageType === 'LIST_MESSAGE' && options.length > 0 && (
              <div className="border-t border-slate-200 px-2 py-2 animate-in fade-in slide-in-from-bottom-2 duration-400">
                <button
                  onClick={() =>
                    setExpandedListIndex(expandedListIndex === 0 ? 1 : 0)
                  }
                  role="listbox"
                  aria-expanded={expandedListIndex === 1}
                  aria-label="View options dropdown"
                  className="w-full flex items-center justify-between rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-300 px-2 py-1.5 text-xs font-medium text-blue-700 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span>View Options</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${
                      expandedListIndex === 1 ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {/* Expanded List */}
                {expandedListIndex === 1 && (
                  <div className="mt-1.5 space-y-1 rounded-lg bg-slate-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {options.map((opt, idx) => (
                      <div
                        key={idx}
                        role="option"
                        onMouseEnter={() => setHoveredOptionIndex(idx)}
                        onMouseLeave={() => setHoveredOptionIndex(null)}
                        className={`rounded px-2 py-1.5 cursor-pointer transition-all duration-150 transform ${
                          hoveredOptionIndex === idx
                            ? 'bg-slate-200 scale-102 pl-3'
                            : 'hover:bg-slate-100'
                        }`}
                        tabIndex="0"
                        aria-label={`${opt.optionText || `Option ${idx + 1}`}${opt.description ? ': ' + opt.description : ''}`}
                      >
                        <p className="text-xs font-medium text-slate-900">
                          {opt.optionText || `Option ${idx + 1}`}
                        </p>
                        {opt.description && (
                          <p className="text-xs text-slate-600 mt-0.5">
                            {opt.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {messageType === 'FLOW_BUTTON' && options.length > 0 && (
              <div className="border-t border-slate-200 px-2 py-2 animate-in fade-in slide-in-from-bottom-2 duration-400">
                <button
                  className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-2 py-1.5 text-xs font-medium text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  disabled
                  aria-label={`Button: ${options[0]?.optionText || 'Open Link'}`}
                >
                  {options[0]?.optionText || 'Open Link'} →
                </button>
              </div>
            )}

            {/* Footer */}
            {footerText && (
              <div className="border-t border-slate-200 bg-slate-50 px-3 py-1.5 animate-in fade-in slide-in-from-bottom-1 duration-300">
                <p className="text-xs text-slate-500">{footerText}</p>
              </div>
            )}
          </div>

          {/* Empty State */}
          {!bodyText && (
            <div className="text-center py-4 animate-pulse">
              <p className="text-xs text-slate-400">
                Enter message content to see preview
              </p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-700 bg-white px-3 py-2 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            disabled
            className="flex-1 text-xs text-slate-400 bg-white border-0 outline-none"
            aria-label="Message input (read-only preview)"
          />
          <button
            disabled
            className="text-slate-400 transition-opacity duration-200"
            aria-label="Attachment button (disabled in preview)"
          >
            📎
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <p className="text-xs text-blue-700">
          <span className="font-semibold">Preview:</span> Shows how your message
          appears on WhatsApp. Button interactions are simulated - actual responses
          handled by webhook integration.
        </p>
      </div>
    </div>
  );
}
