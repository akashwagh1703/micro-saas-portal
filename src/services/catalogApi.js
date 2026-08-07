import api from './api';

/** Catalog / brochure APIs (Phase 1–2 backend). */

export async function getCatalogSite() {
  const { data } = await api.get('/catalog');
  return data?.site ?? null;
}

export async function createCatalogSite(payload) {
  const { data } = await api.post('/catalog', payload);
  return data?.site;
}

export async function updateCatalogSite(payload) {
  const { data } = await api.patch('/catalog', payload);
  return data?.site;
}

export async function updateCatalogSlug(slug) {
  const { data } = await api.patch('/catalog/slug', { slug });
  return data?.site;
}

export async function publishCatalog() {
  const { data } = await api.post('/catalog/publish');
  return data?.site;
}

export async function unpublishCatalog() {
  const { data } = await api.post('/catalog/unpublish');
  return data?.site;
}

export async function updateCatalogSection(id, payload) {
  const { data } = await api.patch(`/catalog/sections/${id}`, payload);
  return data?.section;
}

export async function listCatalogMedia() {
  const { data } = await api.get('/catalog/media');
  return data?.media ?? [];
}

export async function uploadCatalogMedia(file, { kind = 'image', section_id, alt } = {}) {
  const form = new FormData();
  form.append('file', file);
  form.append('kind', kind);
  if (section_id != null) form.append('section_id', String(section_id));
  if (alt) form.append('alt', alt);
  const { data } = await api.post('/catalog/media/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data?.media;
}

export async function updateCatalogMedia(id, payload) {
  const { data } = await api.patch(`/catalog/media/${id}`, payload);
  return data?.media;
}

export async function deleteCatalogMedia(id) {
  await api.delete(`/catalog/media/${id}`);
}

export async function createCatalogProduct(payload) {
  const { data } = await api.post('/catalog/products', payload);
  return data?.product;
}

export async function updateCatalogProduct(id, payload) {
  const { data } = await api.patch(`/catalog/products/${id}`, payload);
  return data?.product;
}

export async function deleteCatalogProduct(id) {
  await api.delete(`/catalog/products/${id}`);
}

/** Auth-only file bytes (draft preview). */
export async function fetchCatalogMediaBlob(mediaId) {
  const { data } = await api.get(`/catalog/media/${mediaId}/content`, {
    responseType: 'blob',
  });
  return data;
}

export function slugifyBusinessName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}
