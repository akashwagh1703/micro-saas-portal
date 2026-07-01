import { useEffect, useMemo, useState } from 'react';
import { X, ArrowLeft, Sparkles, Check, Wand2, Bot, AlertTriangle, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import api from '../services/api';
import { formatMatchThreshold } from '../constants/career';

const FALLBACK_BUSINESS_OPTIONS = [
  {
    key: 'career_ai',
    label: 'CareerAI Bot',
    hint: `Job seekers on WhatsApp — resumes, ${formatMatchThreshold()}, cover letters.`,
    example: 'Upload resume → matched jobs → apply with cover letter.',
  },
  {
    key: 'farmer',
    label: 'Farmer / Agriculture',
    hint: 'Sell seeds, fertilizers, or advise on crops and seasons.',
    example: 'Customers ask about prices, availability, and farming tips.',
  },
  {
    key: 'real_estate',
    label: 'Real Estate',
    hint: 'Property listings, site visits, and buyer enquiries.',
    example: 'Leads ask for flats, rent, or booking a property tour.',
  },
  {
    key: 'coaching',
    label: 'Coaching Institute',
    hint: 'Courses, admissions, batch timings, and demo classes.',
    example: 'Students ask about fees, syllabus, or trial sessions.',
  },
  {
    key: 'clinic',
    label: 'Clinic / Doctor',
    hint: 'Appointments, timings, reports, and general queries.',
    example: 'Patients book slots or ask clinic hours and location.',
  },
  {
    key: 'local_shop',
    label: 'Local Shop',
    hint: 'Product catalog, prices, stock, and order updates.',
    example: 'Shoppers ask "Do you have this?" or delivery time.',
  },
  {
    key: 'travel',
    label: 'Travel Agency',
    hint: 'Trip packages, bookings, itineraries, and quotes.',
    example: 'Customers enquire about destinations and travel dates.',
  },
  {
    key: 'insurance',
    label: 'Insurance Agent',
    hint: 'Policies, renewals, claims, and premium quotes.',
    example: 'Clients ask about coverage, documents, or renewal.',
  },
  {
    key: 'ca_accountant',
    label: 'CA / Accountant',
    hint: 'Tax filing, GST, documents, and consultation slots.',
    example: 'Clients share queries about ITR, GST, or deadlines.',
  },
  {
    key: 'support',
    label: 'Customer Support Team',
    hint: 'Resolve tickets, FAQs, and follow-ups on WhatsApp.',
    example: 'Users report issues or ask how to use your product.',
  },
  {
    key: 'other',
    label: 'Other business',
    hint: 'Any business not listed above — we generate a custom flow.',
    example: 'Describe your business and we tailor workflows with AI.',
  },
];

const FALLBACK_USE_CASE_OPTIONS = [
  {
    key: 'customer_support',
    label: 'Customer Support',
    hint: 'Answer questions and resolve issues automatically.',
    example: 'Order status, complaints, general help.',
  },
  {
    key: 'lead_generation',
    label: 'Lead Generation',
    hint: 'Capture name, phone, and interest from new chats.',
    example: 'Property enquiry, course demo, insurance quote.',
  },
  {
    key: 'appointment_booking',
    label: 'Appointment Booking',
    hint: 'Collect date, time, and details for bookings.',
    example: 'Doctor visit, site tour, tax consultation.',
  },
  {
    key: 'sales_assistant',
    label: 'Sales Assistant',
    hint: 'Qualify buyers and suggest next steps.',
    example: 'Product recommendations, upsell, follow-up.',
  },
  {
    key: 'faq_bot',
    label: 'FAQ Bot',
    hint: 'Instant answers to common repeated questions.',
    example: 'Timings, prices, location, policies.',
  },
  {
    key: 'ai_chat',
    label: 'AI Chat Assistant',
    hint: 'Flexible AI replies for open-ended conversations.',
    example: 'When customers ask varied or complex questions.',
  },
];

const FALLBACK_RECOMMENDED_USE_CASES = {
  farmer: ['faq_bot', 'customer_support'],
  real_estate: ['lead_generation', 'appointment_booking'],
  coaching: ['lead_generation', 'appointment_booking'],
  clinic: ['appointment_booking', 'faq_bot'],
  local_shop: ['faq_bot', 'customer_support'],
  travel: ['lead_generation', 'appointment_booking'],
  insurance: ['lead_generation', 'customer_support'],
  ca_accountant: ['appointment_booking', 'customer_support'],
  support: ['customer_support', 'faq_bot'],
  career_ai: ['ai_chat'],
  other: ['ai_chat', 'customer_support'],
};

function catalogToOptions(catalog) {
  const verticals = catalog?.verticals ?? FALLBACK_BUSINESS_OPTIONS;
  const useCases = catalog?.use_cases ?? FALLBACK_USE_CASE_OPTIONS;
  const businessOptions = verticals.map((v) => ({
    key: v.key,
    label: v.label,
    hint: v.hint,
    example: v.example,
    kind: v.kind,
    supports_use_case_picker: v.supports_use_case_picker,
  }));
  const useCaseOptions = useCases.map((u) => ({
    key: u.key,
    label: u.label,
    hint: u.hint,
    example: u.example,
  }));
  const recommendedUseCases = Object.fromEntries(
    verticals.map((v) => [v.key, v.recommended_use_cases ?? []]),
  );
  return { businessOptions, useCaseOptions, recommendedUseCases };
}

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
            className={`rounded-lg border px-4 py-3 text-left transition ${
              selected
                ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className={`text-sm font-medium ${selected ? 'text-emerald-800' : 'text-slate-800'}`}>
                {opt.label}
              </span>
              {selected && <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" />}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{opt.hint}</p>
            <p className="mt-1 text-[11px] italic text-slate-400">{opt.example}</p>
          </button>
        );
      })}
    </div>
  );
}

function MultiOptionList({ options, values, onToggle, recommended = [] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => {
        const selected = values.includes(opt.key);
        const isRecommended = recommended.includes(opt.key);
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onToggle(opt.key)}
            className={`relative rounded-lg border px-4 py-3 text-left transition ${
              selected
                ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                : isRecommended
                  ? 'border-violet-200 bg-violet-50/40 hover:border-violet-300'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {isRecommended && !selected && (
              <span className="absolute right-2 top-2 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
                Recommended
              </span>
            )}
            <div className="flex items-start justify-between gap-2 pr-16">
              <span className={`text-sm font-medium ${selected ? 'text-emerald-800' : 'text-slate-800'}`}>
                {opt.label}
              </span>
              {selected && <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" />}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{opt.hint}</p>
            <p className="mt-1 text-[11px] italic text-slate-400">{opt.example}</p>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Guided business setup: one business at a time, multiple use cases (one workflow each).
 */
export default function BusinessWizard({ onClose, onCreated, profile: initialProfile }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState(initialProfile ?? null);
  const [catalog, setCatalog] = useState(null);
  const [business, setBusiness] = useState(null);
  const [businessDescription, setBusinessDescription] = useState('');
  const [useCases, setUseCases] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const { businessOptions, useCaseOptions, recommendedUseCases } = useMemo(
    () => catalogToOptions(catalog),
    [catalog],
  );

  const selectedVertical = businessOptions.find((o) => o.key === business);
  const isOther = business === 'other';
  const isCareerAi = selectedVertical?.kind === 'plugin' || business === 'career_ai';
  const supportsUseCasePicker = selectedVertical?.supports_use_case_picker !== false && !isCareerAi;
  const descriptionRequired = isOther && !businessDescription.trim();
  const isBusinessChange =
    profile?.configured && profile.business_category && business !== profile.business_category;
  const blockBusinessChange = isBusinessChange && !profile.can_change_business;

  const recommendedForBusiness = useMemo(
    () => (business ? recommendedUseCases[business] || [] : []),
    [business, recommendedUseCases],
  );

  const selectedBusinessLabel = selectedVertical?.label;

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  useEffect(() => {
    if (initialProfile) return;
    api.get('/settings/business-profile').then((r) => setProfile(r.data)).catch(() => {});
  }, [initialProfile]);

  useEffect(() => {
    api.get('/platform/verticals').then((r) => setCatalog(r.data)).catch(() => {});
  }, []);

  // Seed wizard fields once from profile — do not reset while user picks a new business.
  const [seededFromProfile, setSeededFromProfile] = useState(false);
  useEffect(() => {
    if (!profile?.configured || seededFromProfile) return;
    setBusiness(profile.business_category);
    setUseCases(profile.use_cases || []);
    if (profile.business_description) {
      setBusinessDescription(profile.business_description);
    }
    setSeededFromProfile(true);
  }, [profile, seededFromProfile]);

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

  const applyRecommended = () => {
    if (recommendedForBusiness.length === 0) return;
    setUseCases(recommendedForBusiness);
    toast.success('Recommended use cases selected');
  };

  const finish = async (overrideUseCases) => {
    const cases = overrideUseCases ?? useCases;
    if (!business || cases.length === 0) return;
    if (isOther && !businessDescription.trim()) {
      toast.error('Please describe your business');
      return;
    }
    if (blockBusinessChange) {
      toast.error('Pause all published workflows before changing your business');
      return;
    }

    const previousCategory = profile?.business_category ?? null;
    setSubmitting(true);
    try {
      const payload = { business_category: business, use_cases: cases };
      if (isOther) payload.business_description = businessDescription.trim();

      const { data } = await api.post('/workflows/setup-business', payload);
      if (business === 'career_ai') {
        await api.post('/career/setup');
      }

      const newProfile = data.business_profile ?? null;
      if (newProfile) {
        setProfile(newProfile);
      }

      const changed = previousCategory !== business;
      if (changed && newProfile?.business_label) {
        toast.success(`Business updated to ${newProfile.business_label}`);
      } else if (business === 'career_ai') {
        toast.success('CareerAI is ready — connect WhatsApp, then fetch jobs');
      } else {
        const count = data.workflows?.length ?? 0;
        toast.success(
          count === 1
            ? '1 auto-reply ready for your business'
            : `${count} auto-replies ready for your business`,
        );
      }

      await onCreated?.(data);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors?.business_description?.[0]) toast.error(errors.business_description[0]);
      else if (errors?.business_category?.[0]) toast.error(errors.business_category[0]);
      else if (errors?.use_cases?.[0]) toast.error(errors.use_cases[0]);
      else toast.error(err.response?.data?.message || 'Failed to set up workflows');
    } finally {
      setSubmitting(false);
    }
  };

  const activateCareerAi = () => {
    if (!business || blockBusinessChange) return;
    setUseCases(['ai_chat']);
    finish(['ai_chat']);
  };

  const handleBusinessSelect = (key) => {
    if (profile?.configured && key !== profile.business_category && !profile.can_change_business) {
      toast.error('Pause all published workflows before selecting a different business');
      return;
    }
    setBusiness(key);
    if (key !== 'other') setBusinessDescription('');
    if (!profile?.configured) setUseCases(recommendedUseCases[key] || []);
  };

  const goToUseCases = () => {
    if (!business) {
      toast.error('Please select your business type first');
      return;
    }
    if (descriptionRequired) {
      toast.error('Please describe your business');
      return;
    }
    if (blockBusinessChange) return;
    if (!profile?.configured && useCases.length === 0 && recommendedForBusiness.length > 0) {
      setUseCases(recommendedForBusiness);
    }
    setStep(2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-600" />
            <h2 className="font-semibold text-slate-900">
              {profile?.configured ? 'Change business type' : 'Set up my business'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {!profile?.configured && (
          <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white px-6 py-4">
            <p className="text-sm font-semibold text-emerald-900">
              {isCareerAi ? 'Activate CareerAI in one step' : 'Set up your business'}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-emerald-800/90">
              {isCareerAi
                ? `WhatsApp bot for resumes, ${formatMatchThreshold('job matches')}, and cover letters — no workflow builder needed.`
                : 'Pick your industry and use cases — we create ready-made workflows for you.'}
            </p>
          </div>
        )}

        {profile?.configured && (
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-3">
            <p className="text-xs text-slate-600">
              Current: <span className="font-medium text-slate-800">{profile.business_label}</span>
              {isBusinessChange && business && (
                <span className="text-emerald-700">
                  {' '}
                  → switching to{' '}
                  {businessOptions.find((o) => o.key === business)?.label ?? business}
                </span>
              )}
            </p>
          </div>
        )}

        <div className="px-6 py-5">
          <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
            <span className={step === 1 ? 'font-semibold text-emerald-600' : ''}>1. Your business</span>
            {!isCareerAi && supportsUseCasePicker && (
              <>
                <span>›</span>
                <span className={step === 2 ? 'font-semibold text-emerald-600' : ''}>2. What to automate</span>
              </>
            )}
          </div>

          {profile?.configured && !profile.can_change_business && step === 1 && (
            <div className="mb-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <p>
                You have {profile.published_count} published workflow(s). Pause them all before changing
                your business.
              </p>
            </div>
          )}

          {step === 1 ? (
            <>
              <div className="mb-4 flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-500" />
                <p>
                  <span className="font-medium text-slate-700">How to choose:</span> Pick the card that best
                  matches your business. One business at a time — add multiple automations in the next step.
                </p>
              </div>
              <p className="mb-3 text-sm font-medium text-slate-700">What is your business?</p>
              <OptionList options={businessOptions} value={business} onSelect={handleBusinessSelect} />
              {isOther && (
                <div className="mt-4">
                  <label htmlFor="business-description" className="mb-1 block text-sm font-medium text-slate-700">
                    Describe your business <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="business-description"
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="e.g. Wedding photography studio in Mumbai"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}
              {!business && (
                <p className="mt-3 text-xs text-amber-700">Select one option above to continue.</p>
              )}
              {isCareerAi && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/90 p-4">
                  <p className="text-sm font-semibold text-emerald-900">CareerAI on WhatsApp</p>
                  <ul className="mt-2 space-y-1.5 text-xs text-emerald-800">
                    <li>• Job seekers upload resume → profile built automatically</li>
                    <li>• Jobs matched by role, skills, location ({formatMatchThreshold()} only)</li>
                    <li>• Tailored cover letter sent as PDF/DOCX</li>
                  </ul>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-violet-100 bg-violet-50/60 px-3 py-2.5">
                <p className="text-xs text-violet-900">
                  <span className="font-medium">Business:</span> {selectedBusinessLabel}
                </p>
                {recommendedForBusiness.length > 0 && (
                  <button
                    type="button"
                    onClick={applyRecommended}
                    className="rounded-md bg-violet-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-violet-700"
                  >
                    Use recommended
                  </button>
                )}
              </div>
              <div className="mb-4 flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-500" />
                <p>
                  Select one or more use cases. Each gets its own workflow with keyword triggers.
                </p>
              </div>
              <p className="mb-3 text-sm font-medium text-slate-700">What do you want to automate?</p>
              <MultiOptionList
                options={useCaseOptions}
                values={useCases}
                onToggle={toggleUseCase}
                recommended={recommendedForBusiness}
              />
              {useCases.length > 0 && (
                <div className="mt-4 space-y-2">
                  {previewLoading ? (
                    <p className="text-xs text-slate-500">Loading previews…</p>
                  ) : (
                    previews.map((preview) => (
                      <div key={preview.use_case} className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                          {preview.generation_mode === 'ai' ? <Bot size={14} /> : <Wand2 size={14} />}
                          {useCaseOptions.find((o) => o.key === preview.use_case)?.label}
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
            isCareerAi ? (
              <Button
                onClick={activateCareerAi}
                loading={submitting}
                disabled={!business || blockBusinessChange}
              >
                Activate CareerAI
              </Button>
            ) : (
              <Button
                onClick={goToUseCases}
                disabled={!business || descriptionRequired || blockBusinessChange}
              >
                Continue
              </Button>
            )
          ) : (
            <Button onClick={() => finish()} loading={submitting} disabled={useCases.length === 0}>
              Create {useCases.length > 1 ? `${useCases.length} auto-replies` : 'auto-reply'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
