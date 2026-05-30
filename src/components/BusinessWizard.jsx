import { useEffect, useState } from 'react';
import { X, ArrowLeft, Sparkles, Check, Wand2, Bot, AlertTriangle } from 'lucide-react';
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

function OptionList({ options, value, onSelect, disabled }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => {
        const selected = value === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(opt.key)}
            className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition ${
              selected
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <span>{opt.label}</span>
            {selected && <Check size={16} className="text-emerald-600" />}
          </button>
        );
      })}
    </div>
  );
}

function MultiOptionList({ options, values, onToggle }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => {
        const selected = values.includes(opt.key);
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onToggle(opt.key)}
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
 * Guided setup: one business at a time, multiple use cases (one workflow each).
 * Changing business requires all current workflows to be paused first.
 */
export default function BusinessWizard({ onClose, onCreated, profile: initialProfile }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState(initialProfile ?? null);
  const [business, setBusiness] = useState(null);
  const [businessDescription, setBusinessDescription] = useState('');
  const [useCases, setUseCases] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const isOther = business === 'other';
  const descriptionRequired = isOther && !businessDescription.trim();
  const isBusinessChange =
    profile?.configured && profile.business_category && business !== profile.business_category;
  const blockBusinessChange = isBusinessChange && !profile.can_change_business;

  useEffect(() => {
    if (initialProfile) return;
    api
      .get('/settings/business-profile')
      .then((r) => setProfile(r.data))
      .catch(() => {});
  }, [initialProfile]);

  useEffect(() => {
    if (!profile?.configured) return;
    setBusiness(profile.business_category);
    setUseCases(profile.use_cases || []);
    if (profile.business_description) {
      setBusinessDescription(profile.business_description);
    }
  }, [profile]);

  useEffect(() => {
    if (step !== 2 || !business || useCases.length === 0) {
      setPreviews([]);
      return;
    }

    setPreviewLoading(true);
    Promise.all(
      useCases.map((useCase) =>
        api
          .get('/workflows/generate/preview', {
            params: {
              business_category: business,
              use_case: useCase,
              ...(isOther && businessDescription.trim()
                ? { business_description: businessDescription.trim() }
                : {}),
            },
          })
          .then((r) => ({ use_case: useCase, ...r.data }))
          .catch(() => null),
      ),
    )
      .then((items) => setPreviews(items.filter(Boolean)))
      .finally(() => setPreviewLoading(false));
  }, [step, business, useCases, businessDescription, isOther]);

  const toggleUseCase = (key) => {
    setUseCases((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const finish = async () => {
    if (!business || useCases.length === 0) return;
    if (isOther && !businessDescription.trim()) {
      toast.error('Please describe your business');
      return;
    }
    if (blockBusinessChange) {
      toast.error('Pause all published workflows before changing your business');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        business_category: business,
        use_cases: useCases,
      };
      if (isOther) {
        payload.business_description = businessDescription.trim();
      }

      const { data } = await api.post('/workflows/setup-business', payload);
      const count = data.workflows?.length ?? 0;
      toast.success(
        count === 1 ? '1 workflow ready for your business' : `${count} workflows ready for your business`,
      );
      onCreated?.(data);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors?.business_description?.[0]) {
        toast.error(errors.business_description[0]);
      } else if (errors?.business_category?.[0]) {
        toast.error(errors.business_category[0]);
      } else if (errors?.use_cases?.[0]) {
        toast.error(errors.use_cases[0]);
      } else {
        toast.error(err.response?.data?.message || 'Failed to set up workflows');
      }
      setSubmitting(false);
    }
  };

  const handleBusinessSelect = (key) => {
    if (profile?.configured && key !== profile.business_category && !profile.can_change_business) {
      toast.error('Pause all published workflows before selecting a different business');
      return;
    }
    setBusiness(key);
    if (key !== 'other') {
      setBusinessDescription('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
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
            <span className={step === 2 ? 'font-semibold text-emerald-600' : ''}>2. Use cases</span>
          </div>

          {profile?.configured && !profile.can_change_business && step === 1 && (
            <div className="mb-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <p>
                You have {profile.published_count} published workflow(s). Pause them all on the
                Workflows page before changing your business.
              </p>
            </div>
          )}

          {step === 1 ? (
            <>
              <p className="mb-1 text-sm font-medium text-slate-700">What is your business?</p>
              <p className="mb-3 text-xs text-slate-500">
                One business at a time. You can run multiple use-case workflows for it.
              </p>
              <OptionList
                options={BUSINESS_OPTIONS}
                value={business}
                onSelect={handleBusinessSelect}
                disabled={false}
              />

              {isOther && (
                <div className="mt-4">
                  <label htmlFor="business-description" className="mb-1 block text-sm font-medium text-slate-700">
                    Describe your business
                  </label>
                  <textarea
                    id="business-description"
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="e.g. Wedding photography studio in Mumbai"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <p className="mb-1 text-sm font-medium text-slate-700">What do you want to automate?</p>
              <p className="mb-3 text-xs text-slate-500">
                Select one or more — each use case gets its own workflow with smart keyword triggers.
              </p>
              <MultiOptionList options={USE_CASE_OPTIONS} values={useCases} onToggle={toggleUseCase} />

              {useCases.length > 0 && (
                <div className="mt-4 space-y-2">
                  {previewLoading ? (
                    <p className="text-xs text-slate-500">Loading previews…</p>
                  ) : (
                    previews.map((preview) => (
                      <div
                        key={preview.use_case}
                        className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3"
                      >
                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                          {preview.generation_mode === 'ai' ? <Bot size={14} /> : <Wand2 size={14} />}
                          {USE_CASE_OPTIONS.find((o) => o.key === preview.use_case)?.label}
                          <span className="text-xs font-normal text-slate-500">→ {preview.template_name}</span>
                        </div>
                        {preview.node_types?.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {preview.node_types.map((type) => (
                              <span
                                key={type}
                                className="rounded bg-white px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200"
                              >
                                {NODE_LABELS[type] || type}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
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
            <Button
              onClick={() => setStep(2)}
              disabled={!business || descriptionRequired || blockBusinessChange}
            >
              Continue
            </Button>
          ) : (
            <Button onClick={finish} loading={submitting} disabled={useCases.length === 0}>
              Create {useCases.length > 1 ? `${useCases.length} workflows` : 'workflow'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
