import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import api from '../../services/api';

export default function InteractiveMessageBuilder({ template, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    messageType: 'QUICK_REPLY',
    headerText: '',
    bodyText: '',
    footerText: '',
    options: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        messageType: template.messageType || 'QUICK_REPLY',
        headerText: template.headerText || '',
        bodyText: template.bodyText || '',
        footerText: template.footerText || '',
        options: template.options || [],
      });
    }
  }, [template]);

  const maxOptions = {
    QUICK_REPLY: 3,
    LIST_MESSAGE: 10,
    FLOW_BUTTON: 1,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset options when changing type
      ...(name === 'messageType' && { options: [] }),
    }));
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value, displayOrder: index };
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    if (formData.options.length < maxOptions[formData.messageType]) {
      setFormData((prev) => ({
        ...prev,
        options: [
          ...prev.options,
          {
            optionText: '',
            description: '',
            nextNodeId: '',
            displayOrder: prev.options.length,
            metadata: {},
          },
        ],
      }));
    }
  };

  const removeOption = (index) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    if (!formData.bodyText.trim()) {
      toast.error('Message body is required');
      return;
    }

    if (formData.options.length === 0) {
      toast.error('At least one option is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        messageType: formData.messageType,
        headerText: formData.headerText || undefined,
        bodyText: formData.bodyText,
        footerText: formData.footerText || undefined,
        options: formData.options.map((opt) => ({
          optionText: opt.optionText,
          description: opt.description || undefined,
          nextNodeId: opt.nextNodeId || undefined,
          displayOrder: opt.displayOrder,
          metadata: opt.metadata || {},
        })),
      };

      let response;
      if (template) {
        response = await api.put(`/interactive-messages/${template.id}`, payload);
        toast.success('Template updated successfully');
      } else {
        response = await api.post('/interactive-messages', payload);
        toast.success('Template created successfully');
      }

      if (onSave) {
        onSave(response.data);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save template';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">Template Information</h3>

        <div>
          <label className="text-xs font-medium text-slate-700">Template Name</label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Order Confirmation"
            className="mt-1"
            maxLength={100}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700">Message Type</label>
          <select
            name="messageType"
            value={formData.messageType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
          >
            <option value="QUICK_REPLY">Quick Reply (Max 3 buttons)</option>
            <option value="LIST_MESSAGE">List Message (Max 10 options)</option>
            <option value="FLOW_BUTTON">Flow Button (Single URL button)</option>
          </select>
        </div>
      </div>

      {/* Message Content */}
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">Message Content</h3>

        <div>
          <label className="text-xs font-medium text-slate-700">Header Text (Optional)</label>
          <Input
            name="headerText"
            value={formData.headerText}
            onChange={handleChange}
            placeholder="Header message"
            className="mt-1"
            maxLength={1000}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700">Body Text</label>
          <textarea
            name="bodyText"
            value={formData.bodyText}
            onChange={handleChange}
            placeholder="Enter your message here"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            rows={3}
            maxLength={1024}
          />
          <p className="mt-1 text-xs text-slate-500">
            {formData.bodyText.length}/1024 characters
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700">Footer Text (Optional)</label>
          <Input
            name="footerText"
            value={formData.footerText}
            onChange={handleChange}
            placeholder="Footer message"
            className="mt-1"
            maxLength={1000}
          />
        </div>
      </div>

      {/* Options/Buttons */}
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Options ({formData.options.length}/{maxOptions[formData.messageType]})
          </h3>
          {formData.options.length < maxOptions[formData.messageType] && (
            <Button variant="secondary" size="sm" onClick={addOption}>
              + Add Option
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {formData.options.map((option, index) => (
            <div key={index} className="space-y-2 rounded-lg bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Option {index + 1}</span>
                <button
                  onClick={() => removeOption(index)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>

              <Input
                value={option.optionText}
                onChange={(e) => handleOptionChange(index, 'optionText', e.target.value)}
                placeholder="Button/Option text"
                maxLength={100}
              />

              {(formData.messageType === 'LIST_MESSAGE' || formData.messageType === 'QUICK_REPLY') && (
                <Input
                  value={option.description || ''}
                  onChange={(e) => handleOptionChange(index, 'description', e.target.value)}
                  placeholder="Description (optional)"
                  maxLength={500}
                />
              )}

              {formData.messageType === 'FLOW_BUTTON' && (
                <Input
                  value={option.metadata?.url || ''}
                  onChange={(e) =>
                    handleOptionChange(index, 'metadata', { url: e.target.value })
                  }
                  placeholder="URL (https://...)"
                />
              )}

              <Input
                value={option.nextNodeId || ''}
                onChange={(e) => handleOptionChange(index, 'nextNodeId', e.target.value)}
                placeholder="Next node ID (optional)"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Preview</h3>
        <div className="max-w-sm rounded-lg bg-white shadow-sm">
          {formData.headerText && (
            <div className="border-b border-slate-200 bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700">
              {formData.headerText}
            </div>
          )}
          <div className="px-4 py-3">
            <p className="text-sm text-slate-900">{formData.bodyText || 'Message content...'}</p>
          </div>

          {formData.messageType === 'QUICK_REPLY' && (
            <div className="space-y-2 border-t border-slate-200 px-4 py-3">
              {formData.options.slice(0, 3).map((opt, i) => (
                <button
                  key={i}
                  className="block w-full rounded-lg bg-emerald-500 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-600"
                >
                  {opt.optionText || `Option ${i + 1}`}
                </button>
              ))}
            </div>
          )}

          {formData.messageType === 'LIST_MESSAGE' && (
            <div className="border-t border-slate-200 px-4 py-3">
              <button className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                View Options ▼
              </button>
            </div>
          )}

          {formData.messageType === 'FLOW_BUTTON' && (
            <div className="border-t border-slate-200 px-4 py-3">
              <button className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-600">
                {formData.options[0]?.optionText || 'Open Link'} →
              </button>
            </div>
          )}

          {formData.footerText && (
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
              {formData.footerText}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} loading={saving}>
          {template ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </div>
  );
}
