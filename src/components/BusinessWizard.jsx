import { useEffect, useState } from 'react';
import { X, ArrowLeft, Sparkles, Check, Wand2, Bot } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import api from '../services/api';

const BUSINESS_OPTIONS = [
  { key: 'farmer', label: 'Farmer / Agriculture' },
  { key: 'real_estate', label: 'Real Estate' },
  { key: 'coaching', label: 'Coaching Institute' },
  { key: 'clinic', label: 'Clinic / Doctor' },
  { key: 'local_shop', label: 'Local Shop' },
  { key: 'travel', label: 'Travel Agency' },
  { key: 'insurance', label: 'Insurance Agent' },
  { key: 'ca_accountant', label: 'CA / Accountant' },
  { key: 'support', label: 'Customer Support Team' },
  { key: 'other', label: 'Other' },
];

const USE_CASE_OPTIONS = [
  { key: 'customer_support', label: 'Customer Support' },
  { key: 'lead_generation', label: 'Lead Generation' },
  { key: 'appointment_booking', label: 'Appointment Booking' },
  { key: 'sales_assistant', label: 'Sales Assistant' },
  { key: 'faq_bot', label: 'FAQ Bot' },
  { key: 'ai_chat', label: 'AI Chat Assistant' },
];

const NODE_LABELS = {
  trigger: 'Trigger',
  condition: 'Condition',
  collect_input: 'Ask & Wait',
  api: 'API',
  ai: 'AI',
  send_message: 'Send',
};

function OptionList({ options, value, onSelect }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => {
        const selected = value === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onSelect(opt.key)}
            className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition ${
              selected
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span>{opt.label}</span>
            {selected && <Check size={16} className="text-emerald-600" />}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Two-step guided setup: pick a business category, then a use case. On finish it
 * saves the business profile and generates a tailored workflow, then calls
 * onCreated(workflow).
 */
export default function BusinessWizard({ onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [business, setBusiness] = useState(null);
  const [businessDescription, setBusinessDescription] = useState('');
  const [useCase, setUseCase] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const isOther = business === 'other';
  const descriptionRequired = isOther && !businessDescription.trim();

  useEffect(() => {
    if (step !== 2 || !business || !useCase) {
      setPreview(null);
      return;
    }

    setPreviewLoading(true);
    const params = { business_category: business, use_case: useCase };
    if (isOther && businessDescription.trim()) {
      params.business_description = businessDescription.trim();
    }

    api
      .get('/workflows/generate/preview', { params })
      .then((r) => setPreview(r.data))
      .catch(() => setPreview(null))
      .finally(() => setPreviewLoading(false));
  }, [step, business, useCase, businessDescription, isOther]);

  const finish = async () => {
    if (!business || !useCase) return;
    if (isOther && !businessDescription.trim()) {
      toast.error('Please describe your business');
      return;
    }

    setSubmitting(true);
    try {
      const profilePayload = {
        business_category: business,
        use_case: useCase,
      };
      if (isOther) {
        profilePayload.business_description = businessDescription.trim();
      }

      await api.put('/settings/business-profile', profilePayload);

      const generatePayload = { ...profilePayload };
      const { data } = await api.post('/workflows/generate', generatePayload);
      toast.success(
        preview?.generation_mode === 'ai'
          ? 'AI workflow created for your business'
          : 'Workflow created for your business',
      );
      onCreated?.(data.workflow);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors?.business_description?.[0]) {
        toast.error(errors.business_description[0]);
      } else {
        toast.error(err.response?.data?.message || 'Failed to generate workflow');
      }
      setSubmitting(false);
    }
  };

  const handleBusinessSelect = (key) => {
    setBusiness(key);
    if (key !== 'other') {
      setBusinessDescription('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-600" />
            <h2 className="font-semibold text-slate-900">Guided Setup</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
            <span className={step === 1 ? 'font-semibold text-emerald-600' : ''}>1. Business</span>
            <span>›</span>
            <span className={step === 2 ? 'font-semibold text-emerald-600' : ''}>2. Use case</span>
          </div>

          {step === 1 ? (
            <>
              <p className="mb-3 text-sm font-medium text-slate-700">What is your business?</p>
              <OptionList options={BUSINESS_OPTIONS} value={business} onSelect={handleBusinessSelect} />

              {isOther && (
                <div className="mt-4">
                  <label htmlFor="business-description" className="mb-1 block text-sm font-medium text-slate-700">
                    Describe your business
                  </label>
                  <p className="mb-2 text-xs text-slate-500">
                    We use this to generate a custom workflow with AI.
                  </p>
                  <textarea
                    id="business-description"
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="e.g. Wedding photography studio in Mumbai offering packages and booking consultations"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="mt-1 text-right text-[10px] text-slate-400">
                    {businessDescription.length}/500
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="mb-1 text-sm font-medium text-slate-700">What do you want to automate?</p>
              <p className="mb-3 text-xs text-slate-500">
                Pick one for now — you can create more workflows later.
              </p>
              <OptionList options={USE_CASE_OPTIONS} value={useCase} onSelect={setUseCase} />

              {useCase && (
                <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
                  {previewLoading ? (
                    <p className="text-xs text-slate-500">Loading preview…</p>
                  ) : preview ? (
                    <>
                      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                        {preview.generation_mode === 'ai' ? (
                          <Bot size={14} />
                        ) : (
                          <Wand2 size={14} />
                        )}
                        {preview.template_name}
                        {preview.generation_mode === 'ai' && (
                          <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
                            AI
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        {preview.description}
                      </p>
                      {preview.generation_mode === 'ai' ? (
                        <p className="mt-2 text-[10px] text-slate-500">
                          Steps are generated when you click Create — typically includes Ask &amp; Wait,
                          AI, and Send nodes.
                        </p>
                      ) : (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {preview.node_types?.map((type) => (
                            <span
                              key={type}
                              className="rounded bg-white px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200"
                            >
                              {NODE_LABELS[type] || type}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          {step === 2 ? (
            <Button variant="secondary" onClick={() => setStep(1)} disabled={submitting}>
              <ArrowLeft size={14} className="mr-1 inline" /> Back
            </Button>
          ) : (
            <span />
          )}

          {step === 1 ? (
            <Button onClick={() => setStep(2)} disabled={!business || descriptionRequired}>
              Continue
            </Button>
          ) : (
            <Button onClick={finish} loading={submitting} disabled={!useCase}>
              Create my workflow
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
