import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';

/**
 * TemplateGallery Component
 * Displays pre-built template examples that users can copy or customize
 */
export default function TemplateGallery({ onSelectTemplate, onCreateFromTemplate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  const categories = [
    { id: 'all', name: 'All Templates', icon: '📋' },
    { id: 'sales', name: 'Sales', icon: '💼' },
    { id: 'support', name: 'Support', icon: '🤝' },
    { id: 'survey', name: 'Surveys', icon: '📊' },
    { id: 'booking', name: 'Booking', icon: '📅' },
  ];

  const templates = [
    // Sales Templates
    {
      id: 'sales-1',
      category: 'sales',
      name: 'Order Confirmation',
      description: 'Confirm order details and next steps',
      messageType: 'QUICK_REPLY',
      headerText: 'Order #12345',
      bodyText: 'Your order has been confirmed! Is everything correct?',
      footerText: 'Reply to confirm',
      options: [
        { optionText: 'Yes, Confirmed', description: 'Order is correct' },
        { optionText: 'No, Edit Order', description: 'Need to make changes' },
      ],
      useCount: 245,
    },
    {
      id: 'sales-2',
      category: 'sales',
      name: 'Product Inquiry Response',
      description: 'Help customers learn about products',
      messageType: 'LIST_MESSAGE',
      bodyText: 'What product would you like to know more about?',
      options: [
        { optionText: 'Product A', description: 'Premium option' },
        { optionText: 'Product B', description: 'Standard option' },
        { optionText: 'Product C', description: 'Budget option' },
      ],
      useCount: 312,
    },
    {
      id: 'sales-3',
      category: 'sales',
      name: 'Discount Code Claim',
      description: 'Offer exclusive discount codes',
      messageType: 'FLOW_BUTTON',
      bodyText: 'Get 20% off your next purchase with our exclusive code!',
      options: [
        { optionText: 'Claim Now', metadata: { url: 'https://example.com/discount' } },
      ],
      useCount: 189,
    },

    // Support Templates
    {
      id: 'support-1',
      category: 'support',
      name: 'Issue Type Selection',
      description: 'Route customers to appropriate support',
      messageType: 'LIST_MESSAGE',
      bodyText: 'What issue are you experiencing?',
      options: [
        { optionText: 'Billing Issue', description: 'Payment or invoice related' },
        { optionText: 'Technical Issue', description: 'Product not working' },
        { optionText: 'Shipping', description: 'Order delivery question' },
        { optionText: 'Other', description: 'Something else' },
      ],
      useCount: 567,
    },
    {
      id: 'support-2',
      category: 'support',
      name: 'Satisfaction Rating',
      description: 'Rate customer satisfaction',
      messageType: 'QUICK_REPLY',
      bodyText: 'How would you rate our support service?',
      options: [
        { optionText: 'Very Happy', description: 'Great service' },
        { optionText: 'Satisfied', description: 'Good service' },
        { optionText: 'Needs Improvement', description: 'Could be better' },
      ],
      useCount: 423,
    },
    {
      id: 'support-3',
      category: 'support',
      name: 'Contact Support',
      description: 'Direct to support portal',
      messageType: 'FLOW_BUTTON',
      bodyText: 'Need immediate assistance? Contact our support team!',
      options: [
        { optionText: 'Contact Support', metadata: { url: 'https://example.com/support' } },
      ],
      useCount: 156,
    },

    // Survey Templates
    {
      id: 'survey-1',
      category: 'survey',
      name: 'Quick Feedback',
      description: 'Collect quick feedback from customers',
      messageType: 'QUICK_REPLY',
      bodyText: 'Was your experience satisfactory?',
      options: [
        { optionText: 'Yes', description: 'It was great' },
        { optionText: 'No', description: 'It was poor' },
      ],
      useCount: 712,
    },
    {
      id: 'survey-2',
      category: 'survey',
      name: 'Feature Survey',
      description: 'Ask about feature preferences',
      messageType: 'LIST_MESSAGE',
      bodyText: 'Which feature would you like us to improve?',
      options: [
        { optionText: 'User Interface', description: 'Look and feel' },
        { optionText: 'Performance', description: 'Speed and reliability' },
        { optionText: 'Features', description: 'More capabilities' },
        { optionText: 'Support', description: 'Customer service' },
        { optionText: 'Pricing', description: 'Cost and value' },
      ],
      useCount: 456,
    },

    // Booking Templates
    {
      id: 'booking-1',
      category: 'booking',
      name: 'Time Slot Selection',
      description: 'Let customers pick appointment times',
      messageType: 'LIST_MESSAGE',
      headerText: 'Available Times',
      bodyText: 'Select a time slot for your appointment',
      options: [
        { optionText: '9:00 AM - 10:00 AM', description: 'Morning slot' },
        { optionText: '2:00 PM - 3:00 PM', description: 'Afternoon slot' },
        { optionText: '4:00 PM - 5:00 PM', description: 'Evening slot' },
      ],
      useCount: 334,
    },
    {
      id: 'booking-2',
      category: 'booking',
      name: 'Booking Confirmation',
      description: 'Confirm booking details',
      messageType: 'QUICK_REPLY',
      headerText: 'Booking Details',
      bodyText: 'April 25, 2024 at 2:00 PM - Does this work for you?',
      footerText: 'Confirm your appointment',
      options: [
        { optionText: 'Confirm', description: 'Yes, book it' },
        { optionText: 'Reschedule', description: 'Pick different time' },
      ],
      useCount: 289,
    },
    {
      id: 'booking-3',
      category: 'booking',
      name: 'Service Selection',
      description: 'Choose service type',
      messageType: 'LIST_MESSAGE',
      bodyText: 'What service would you like to book?',
      options: [
        { optionText: 'Consultation', description: '30 minutes' },
        { optionText: 'Session', description: '60 minutes' },
        { optionText: 'Workshop', description: '2 hours' },
      ],
      useCount: 198,
    },
  ];

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (template) => {
    const templateJson = JSON.stringify(template, null, 2);
    navigator.clipboard.writeText(templateJson);
    setCopiedId(template.id);
    toast.success('Template copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateFromTemplate = (template) => {
    if (onCreateFromTemplate) {
      onCreateFromTemplate({
        name: `${template.name} - Custom`,
        messageType: template.messageType,
        headerText: template.headerText || '',
        bodyText: template.bodyText,
        footerText: template.footerText || '',
        options: template.options.map((opt) => ({
          optionText: opt.optionText,
          description: opt.description || '',
          nextNodeId: '',
          displayOrder: template.options.indexOf(opt),
          metadata: opt.metadata || {},
        })),
      });
      toast.success('Template loaded - Ready to customize');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Template Gallery</h2>
        <p className="text-sm text-slate-600 mt-1">
          Pre-built templates to get started quickly. Customize and use them in your workflows.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search */}
      <div>
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-slate-600">No templates found matching your search.</p>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-lg transition-shadow"
            >
              {/* Template Info */}
              <div className="mb-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{template.name}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {template.description}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${
                      template.messageType === 'QUICK_REPLY'
                        ? 'bg-emerald-100 text-emerald-700'
                        : template.messageType === 'LIST_MESSAGE'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {template.messageType === 'QUICK_REPLY' && '🔘'}
                    {template.messageType === 'LIST_MESSAGE' && '📋'}
                    {template.messageType === 'FLOW_BUTTON' && '🔗'}
                  </span>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-slate-50 rounded p-2.5 mb-3 text-sm text-slate-700">
                <p className="font-medium text-slate-900 mb-1">Preview:</p>
                <p className="text-xs line-clamp-2">{template.bodyText}</p>
                {template.options?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {template.options.slice(0, 2).map((opt, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded"
                      >
                        {opt.optionText}
                      </span>
                    ))}
                    {template.options.length > 2 && (
                      <span className="inline-block text-xs text-slate-600">
                        +{template.options.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="text-xs text-slate-600 mb-3 flex items-center gap-2">
                <span>📊 {template.useCount.toLocaleString()} uses</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleCopy(template)}
                >
                  {copiedId === template.id ? (
                    <Check size={14} />
                  ) : (
                    <Copy size={14} />
                  )}
                  {copiedId === template.id ? 'Copied' : 'Copy'}
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleCreateFromTemplate(template)}
                >
                  Use Template
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
        <p className="text-xs text-blue-700">
          <span className="font-semibold">Tip:</span> Click "Use Template" to load a
          template as a starting point. You can then customize it with your own text,
          options, and node routing.
        </p>
      </div>
    </div>
  );
}
