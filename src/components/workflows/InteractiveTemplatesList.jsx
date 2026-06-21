import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import api from '../../services/api';
import InteractiveMessageBuilder from './InteractiveMessageBuilder';

export default function InteractiveTemplatesList() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/interactive-messages');
      setTemplates(Array.isArray(data) ? data : data.templates || []);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch templates';
      toast.error(message);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this template permanently?')) return;

    setDeleting(id);
    try {
      await api.delete(`/interactive-messages/${id}`);
      toast.success('Template deleted');
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete template';
      toast.error(message);
    } finally {
      setDeleting(null);
    }
  };

  const handleSave = (template) => {
    setShowBuilder(false);
    setSelectedTemplate(null);
    fetchTemplates();
  };

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const typeLabels = {
    QUICK_REPLY: 'Quick Reply (3 buttons)',
    LIST_MESSAGE: 'List Message (10 options)',
    FLOW_BUTTON: 'Flow Button (URL)',
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'QUICK_REPLY':
        return 'bg-emerald-100 text-emerald-700';
      case 'LIST_MESSAGE':
        return 'bg-blue-100 text-blue-700';
      case 'FLOW_BUTTON':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (showBuilder) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {selectedTemplate ? 'Edit Template' : 'Create New Template'}
          </h2>
          <button
            onClick={() => {
              setShowBuilder(false);
              setSelectedTemplate(null);
            }}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
        <InteractiveMessageBuilder
          template={selectedTemplate}
          onSave={handleSave}
          onCancel={() => {
            setShowBuilder(false);
            setSelectedTemplate(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Interactive Message Templates</h2>
          <p className="text-sm text-slate-500">Create and manage templates for buttons and dropdown messages</p>
        </div>
        <Button
          onClick={() => {
            setSelectedTemplate(null);
            setShowBuilder(true);
          }}
        >
          + New Template
        </Button>
      </div>

      {/* Search */}
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white py-8">
          <p className="text-sm text-slate-500">Loading templates…</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-500">
            {templates.length === 0
              ? 'No templates yet. Create one to get started!'
              : 'No templates match your search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-slate-900">{template.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{template.bodyText}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(template.messageType)}`}>
                    {typeLabels[template.messageType]}
                  </span>
                  <span className="inline-block rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                    {template.options?.length || 0} option{template.options?.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowBuilder(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                  loading={deleting === template.id}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
