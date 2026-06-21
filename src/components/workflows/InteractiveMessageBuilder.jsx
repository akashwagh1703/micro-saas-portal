import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import api from '../../services/api';
import MessageTypeSelector from './MessageTypeSelector';
import OptionsBuilder from './OptionsBuilder';
import MessagePreview from './MessagePreview';

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
  const [showPreview, setShowPreview] = useState(true);

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

  const handleMessageTypeChange = (newType) => {
    setFormData((prev) => ({
      ...prev,
      messageType: newType,
      options: [], // Clear options when changing type
    }));
  };

  const handleOptionsChange = (newOptions) => {
    setFormData((prev) => ({
      ...prev,
      options: newOptions,
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
      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Form */}
        <div className="space-y-6">
          {/* Template Info */}
          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Template Information
            </h3>

            <div>
              <label className="text-xs font-medium text-slate-700">
                Template Name
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Order Confirmation"
                className="mt-1"
                maxLength={100}
              />
            </div>
          </div>

          {/* Message Type Selector */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <MessageTypeSelector
              value={formData.messageType}
              onChange={handleMessageTypeChange}
            />
          </div>

          {/* Message Content */}
          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Message Content
            </h3>

            <div>
              <label className="text-xs font-medium text-slate-700">
                Header Text (Optional)
              </label>
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
              <label className="text-xs font-medium text-slate-700">
                Body Text
              </label>
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
              <label className="text-xs font-medium text-slate-700">
                Footer Text (Optional)
              </label>
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

          {/* Options Builder */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <OptionsBuilder
              options={formData.options}
              messageType={formData.messageType}
              maxOptions={maxOptions[formData.messageType]}
              onOptionsChange={handleOptionsChange}
              onError={(error) => toast.error(error)}
            />
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

        {/* Right Column: Preview */}
        <div className="sticky top-4 h-fit">
          <MessagePreview formData={formData} />
        </div>
      </div>
    </div>
  );
}
