/** Default / merge helpers for CatalogSection.config JSON. */

export const SECTION_META = {
  header: {
    label: 'Header',
    hint: 'Logo and business name at the top of the page',
  },
  hero: {
    label: 'Hero',
    hint: 'Main banner, headline, and short intro',
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
  contact: {
    label: 'Contact',
    hint: 'Phone, WhatsApp, email, and address',
  },
};

export const SECTION_ORDER = ['header', 'hero', 'about', 'gallery', 'products', 'contact'];

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
      };
    case 'about':
      return { body: '' };
    case 'gallery':
      return { caption: '' };
    case 'products':
      return { intro: '' };
    case 'contact':
      return {
        show_phone: true,
        show_email: true,
        show_whatsapp: true,
        show_address: true,
        note: '',
      };
    default:
      return {};
  }
}

export function mergeSectionConfig(type, config) {
  return { ...defaultSectionConfig(type), ...(config && typeof config === 'object' ? config : {}) };
}
