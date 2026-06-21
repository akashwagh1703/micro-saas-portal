import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../../services/api';

/**
 * useInteractiveTemplates Hook
 * Manages interactive message templates with full CRUD operations
 */
export function useInteractiveTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all templates
  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/interactive-messages');
      setTemplates(Array.isArray(data) ? data : data.templates || []);
      return Array.isArray(data) ? data : data.templates || [];
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch templates';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get single template
  const getTemplate = async (templateId) => {
    try {
      const { data } = await api.get(`/interactive-messages/${templateId}`);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch template';
      toast.error(message);
      return null;
    }
  };

  // Create template
  const createTemplate = async (templateData) => {
    try {
      const { data } = await api.post('/interactive-messages', templateData);
      setTemplates((prev) => [...prev, data]);
      toast.success('Template created successfully');
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create template';
      toast.error(message);
      throw err;
    }
  };

  // Update template
  const updateTemplate = async (templateId, templateData) => {
    try {
      const { data } = await api.put(
        `/interactive-messages/${templateId}`,
        templateData
      );
      setTemplates((prev) =>
        prev.map((t) => (t.id === templateId ? data : t))
      );
      toast.success('Template updated successfully');
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update template';
      toast.error(message);
      throw err;
    }
  };

  // Delete template
  const deleteTemplate = async (templateId) => {
    try {
      await api.delete(`/interactive-messages/${templateId}`);
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      toast.success('Template deleted successfully');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete template';
      toast.error(message);
      throw err;
    }
  };

  // Search templates
  const searchTemplates = (searchTerm) => {
    if (!searchTerm.trim()) {
      return templates;
    }
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.bodyText.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Filter by type
  const filterByType = (messageType) => {
    if (!messageType) {
      return templates;
    }
    return templates.filter((t) => t.messageType === messageType);
  };

  // Duplicate template
  const duplicateTemplate = async (templateId) => {
    try {
      const original = await getTemplate(templateId);
      if (!original) return null;

      const newData = {
        ...original,
        name: `${original.name} (Copy)`,
      };
      delete newData.id;
      delete newData.createdAt;
      delete newData.updatedAt;

      return await createTemplate(newData);
    } catch (err) {
      toast.error('Failed to duplicate template');
      throw err;
    }
  };

  // Initial load
  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    searchTemplates,
    filterByType,
    duplicateTemplate,
  };
}
