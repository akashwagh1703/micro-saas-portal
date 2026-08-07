/** Default / merge helpers for CatalogSection.config JSON. */

export const SECTION_META = {
  header: {
    label: 'Header',
    hint: 'Logo and business name at the top of the page',
  },
  hero: {
    label: 'Hero',
    hint: 'Banner with headline, slider, or optional video',
  },
  highlights: {
    label: 'Highlights',
    hint: 'Short stats under the hero (years, customers, delivery…)',
  },
  about: {
    label: 'About',
    hint: 'Your story and what you offer',
  },
  gallery: {
    label: 'Gallery',
    hint: 'Photos customers see on the brochure',
  },
  products: {
    label: 'Products',
    hint: 'Items with optional display prices (no checkout)',
  },
  testimonials: {
    label: 'Testimonials',
    hint: 'Customer quotes that build trust',
  },
  faq: {
    label: 'FAQ',
    hint: 'Common questions customers ask',
  },
  contact: {
    label: 'Contact',
    hint: 'Phone, WhatsApp, email, address, and optional map',
  },
  footer: {
    label: 'Footer',
    hint: 'Bottom bar, social links, and contact shortcuts',
  },
};

export const SECTION_ORDER = [
  'header',
  'hero',
  'highlights',
  'about',
  'gallery',
  'products',
  'testimonials',
  'faq',
  'contact',
  'footer',
];

export const THEME_MODES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'auto', label: 'Auto (device)' },
];

export const DEFAULT_THEME = {
  mode: 'light',
  accent: '#0c8a76',
  accent_ink: '#055445',
  hero_from: '#083642',
  hero_to: '#0f7a68',
};

export const HERO_SLIDER_MAX = 5;
export const HIGHLIGHTS_MAX = 4;
export const TESTIMONIALS_MAX = 6;
export const FAQ_MAX = 10;
export const SOCIALS_MAX = 6;

export const SOCIAL_NETWORKS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'x', label: 'X (Twitter)' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'website', label: 'Website' },
];

export function defaultSectionConfig(type) {
  switch (type) {
    case 'header':
      return { show_name: true, show_tagline: true, logo_media_id: null };
    case 'hero':
      return {
        headline: '',
        subheadline: '',
        cta_label: '',
        cta_url: '',
        image_media_id: null,
        slider_media_ids: [],
        slider_interval_sec: 5,
        overlay: 'dark',
        video_url: '',
        prefer_video: false,
      };
    case 'highlights':
      return {
        items: [
          { label: '', text: '' },
          { label: '', text: '' },
        ],
      };
    case 'about':
      return { body: '' };
    case 'gallery':
      return { caption: '' };
    case 'products':
      return { intro: '' };
    case 'testimonials':
      return {
        items: [{ name: '', role: '', quote: '', rating: 5, photo_media_id: null }],
      };
    case 'faq':
      return {
        items: [
          { question: '', answer: '' },
          { question: '', answer: '' },
        ],
      };
    case 'contact':
      return {
        show_phone: true,
        show_email: true,
        show_whatsapp: true,
        show_address: true,
        note: '',
        show_map: false,
        map_query: '',
        map_embed_url: '',
      };
    case 'footer':
      return {
        note: '',
        show_name: true,
        show_contact: true,
        show_whatsapp_cta: true,
        socials: [],
      };
    default:
      return {};
  }
}

function normalizeHighlights(items) {
  const list = Array.isArray(items) ? items : [];
  return list
    .slice(0, HIGHLIGHTS_MAX)
    .map((it) => ({
      label: String(it?.label ?? '').slice(0, 32),
      text: String(it?.text ?? '').slice(0, 80),
    }));
}

function normalizeTestimonials(items) {
  const list = Array.isArray(items) ? items : [];
  return list.slice(0, TESTIMONIALS_MAX).map((it) => {
    const rating = Number(it?.rating);
    return {
      name: String(it?.name ?? '').slice(0, 80),
      role: String(it?.role ?? '').slice(0, 80),
      quote: String(it?.quote ?? '').slice(0, 400),
      rating: Number.isFinite(rating) ? Math.min(5, Math.max(1, Math.round(rating))) : 5,
      photo_media_id: it?.photo_media_id ? Number(it.photo_media_id) : null,
    };
  });
}

function normalizeFaq(items) {
  const list = Array.isArray(items) ? items : [];
  return list.slice(0, FAQ_MAX).map((it) => ({
    question: String(it?.question ?? '').slice(0, 160),
    answer: String(it?.answer ?? '').slice(0, 800),
  }));
}

function normalizeSocials(items) {
  const allowed = new Set(SOCIAL_NETWORKS.map((n) => n.id));
  const list = Array.isArray(items) ? items : [];
  return list
    .slice(0, SOCIALS_MAX)
    .map((it) => ({
      network: allowed.has(it?.network) ? it.network : 'website',
      url: String(it?.url ?? '').trim().slice(0, 300),
    }))
    .filter((it) => it.url);
}

export function mergeSectionConfig(type, config) {
  const base = defaultSectionConfig(type);
  const merged = { ...base, ...(config && typeof config === 'object' ? config : {}) };
  if (type === 'hero') {
    const ids = Array.isArray(merged.slider_media_ids)
      ? merged.slider_media_ids.map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0)
      : [];
    if (!ids.length && merged.image_media_id) {
      ids.push(Number(merged.image_media_id));
    }
    merged.slider_media_ids = [...new Set(ids)].slice(0, HERO_SLIDER_MAX);
    merged.video_url = String(merged.video_url || '').trim();
    merged.prefer_video = !!merged.prefer_video;
  }
  if (type === 'highlights') {
    merged.items = normalizeHighlights(merged.items);
    if (!merged.items.length) merged.items = [{ label: '', text: '' }];
  }
  if (type === 'testimonials') {
    merged.items = normalizeTestimonials(merged.items);
    if (!merged.items.length) {
      merged.items = [{ name: '', role: '', quote: '', rating: 5, photo_media_id: null }];
    }
  }
  if (type === 'faq') {
    merged.items = normalizeFaq(merged.items);
    if (!merged.items.length) merged.items = [{ question: '', answer: '' }];
  }
  if (type === 'contact') {
    merged.map_query = String(merged.map_query || '').slice(0, 300);
    merged.map_embed_url = String(merged.map_embed_url || '').slice(0, 800);
    merged.show_map = !!merged.show_map;
  }
  if (type === 'footer') {
    merged.socials = normalizeSocials(merged.socials);
  }
  return merged;
}

export function mergeTheme(theme) {
  return { ...DEFAULT_THEME, ...(theme && typeof theme === 'object' ? theme : {}) };
}
