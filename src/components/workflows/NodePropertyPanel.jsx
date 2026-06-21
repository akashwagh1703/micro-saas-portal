import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import api from '../../services/api';
import { X } from 'lucide-react';

/**
 * NodePropertyPanel Component
 * Edits properties of a selected interactive message node in the workflow
 */
export default function NodePropertyPanel({ node, onClose, onUpdate }) {
  const [template, setTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(node?.data?.templateId);
  const [nodeLabel, setNodeLabel] = useState(node?.data?.label || 'Interactive Message');
  const [optionRouting, setOptionRouting] = useState(
    node?.data?.optionRouting || {}
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
    if (selectedTemplate) {
      fetchTemplate(selectedTemplate);
    }
  }, [selectedTemplate]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/interactive-messages');
      setTemplates(Array.isArray(data) ? data : data.templates || []);
    } catch (error) {
      toast.error('Failed to load templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplate = async (templateId) => {
    try {
      const { data } = await api.get(`/interactive-messages/${templateId}`);
      setTemplate(data);
    } catch (error) {
      toast.error('Failed to load template details');
    }
  };

  const handleOptionRoutingChange = (optionId, nextNodeId) => {
    setOptionRouting((prev) => ({
      ...prev,
      [optionId]: nextNodeId,
    }));
  };

  const handleSave = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    setSaving(true);
    try {
      const updatedData = {
        templateId: selectedTemplate,
        label: nodeLabel,
        optionRouting: optionRouting,
      };

      if (onUpdate) {
        onUpdate(node.id, updatedData);
      }

      toast.success('Node updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update node');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="sticky top-0 border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Interactive Message Node Properties
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 px-6 py-4">
          {/* Node Label */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Node Label</label>
            <Input
              value={nodeLabel}
              onChange={(e) => setNodeLabel(e.target.value)}
              placeholder="Label for this node in workflow"
              maxLength={100}
            />
            <p className="text-xs text-slate-600">
              Give this node a descriptive name for organization
            </p>
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">
              Interactive Template
            </label>
            <select
              value={selectedTemplate || ''}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none disabled:bg-slate-100"
            >
              <option value="">
                {loading ? 'Loading templates...' : 'Select a template'}
              </option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.messageType})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-600">
              Choose which interactive message template to use for this node
            </p>
          </div>

          {/* Template Preview */}
          {template && (
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Template Preview: {template.name}
              </h3>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Type:</span>
                  <span className="ml-2 text-slate-600">{template.messageType}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Body:</span>
                  <p className="mt-1 text-slate-600 line-clamp-2">
                    {template.bodyText}
                  </p>
                </div>
                {template.options && template.options.length > 0 && (
                  <div>
                    <span className="font-medium text-slate-700 block mb-2">
                      Options ({template.options.length}):
                    </span>
                    <ul className="space-y-1">
                      {template.options.map((opt) => (
                        <li
                          key={opt.id}
                          className="text-xs text-slate-600 flex items-start gap-2"
                        >
                          <span className="text-emerald-600 mt-1">•</span>
                          <span>{opt.optionText}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Option Routing */}
          {template && template.options && template.options.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Option Routing
              </h3>
              <p className="text-xs text-slate-600">
                Specify which workflow node to execute when each option is
                selected
              </p>

              <div className="space-y-2 rounded-lg bg-slate-50 border border-slate-200 p-4">
                {template.options.map((option) => (
                  <div key={option.id} className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                      {option.optionText}
                    </label>
                    <Input
                      value={optionRouting[option.id] || ''}
                      onChange={(e) =>
                        handleOptionRoutingChange(option.id, e.target.value)
                      }
                      placeholder="Next node ID (leave empty if no routing needed)"
                      size="sm"
                    />
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">Node Routing:</span> Enter the
                  ID of the node that should execute when each option is selected.
                  Leave empty if you don't need routing.
                </p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
            <p className="text-xs text-amber-700">
              <span className="font-semibold">Tip:</span> After selecting a
              template, you can configure which nodes should execute when each
              option is selected. This enables branching logic in your workflow.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
