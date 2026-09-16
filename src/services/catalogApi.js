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

/** Friendly message when nginx 413 / network looks like a CORS failure in DevTools. */
export function catalogUploadErrorMessage(err) {
  const status = err?.response?.status;
  const apiMsg = err?.response?.data?.message;
  if (typeof apiMsg === 'string' && apiMsg.trim()) return apiMsg;
  if (status === 413) {
    return 'File is too large for the server. Use an image under 5 MB (or ask admin to raise nginx client_max_body_size).';
  }
  if (!err?.response) {
    return 'Upload blocked (often file too large). Use JPEG/PNG under 5 MB and try again.';
  }
  return 'Upload failed';
}

export async function updateCatalogMedia(id, payload) {
  const { data } = await api.patch(`/catalog/media/${id}`, payload);
  return data?.media;
}

export async function deleteCatalogMedia(id) {
  await api.delete(`/catalog/media/${id}`);
}

export async function createCatalogCategory(payload) {
  const { data } = await api.post('/catalog/categories', payload);
  return data?.category;
}

export async function updateCatalogCategory(id, payload) {
  const { data } = await api.patch(`/catalog/categories/${id}`, payload);
  return data?.category;
}

export async function deleteCatalogCategory(id) {
  await api.delete(`/catalog/categories/${id}`);
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

export async function getCatalogPaymentSettings() {
  const { data } = await api.get('/catalog/payment-settings');
  return data?.payment;
}

export async function updateCatalogPaymentSettings(payload) {
  const { data } = await api.patch('/catalog/payment-settings', payload);
  return data?.payment;
}

/** Auth-only file bytes (draft preview). */
export async function fetchCatalogMediaBlob(mediaId) {
  const { data } = await api.get(`/catalog/media/${mediaId}/content`, {
    responseType: 'blob',
  });
  return data;
}

export async function listCatalogOrders(params = {}) {
  const { data } = await api.get('/catalog/orders', { params });
  return data;
}

export async function fetchCatalogOrdersAnalytics(days = 30) {
  const { data } = await api.get('/catalog/orders/analytics', { params: { days } });
  return data;
}

export async function exportCatalogOrdersCsv(params = {}) {
  const { data } = await api.get('/catalog/orders/export.csv', {
    params,
    responseType: 'blob',
  });
  return data;
}

export async function getCatalogOrder(id) {
  const { data } = await api.get(`/catalog/orders/${id}`);
  return data?.order;
}

export async function createCatalogOrder(payload) {
  const { data } = await api.post('/catalog/orders', payload);
  return data?.order;
}

export async function attachCatalogOrderScreenshot(id, mediaId) {
  const { data } = await api.post(`/catalog/orders/${id}/screenshot`, {
    media_id: mediaId,
  });
  return data?.order;
}

export async function confirmCatalogOrder(id) {
  const { data } = await api.post(`/catalog/orders/${id}/confirm`);
  return data?.order;
}

export async function rejectCatalogOrder(id, reason) {
  const { data } = await api.post(`/catalog/orders/${id}/reject`, {
    reason: reason || null,
  });
  return data?.order;
}

export async function setCatalogOrderShippingAddress(id, payload) {
  const { data } = await api.post(`/catalog/orders/${id}/shipping-address`, payload);
  return data?.order;
}

export async function markCatalogOrderShipped(id, payload) {
  const { data } = await api.post(`/catalog/orders/${id}/ship`, payload);
  return data?.order;
}

export async function bulkMarkCatalogOrdersShipped(items) {
  const { data } = await api.post('/catalog/orders/bulk-ship', { items });
  return data;
}

export async function markCatalogOrderDelivered(id) {
  const { data } = await api.post(`/catalog/orders/${id}/deliver`);
  return data?.order;
}

export async function markCatalogOrderReadyForPickup(id) {
  const { data } = await api.post(`/catalog/orders/${id}/ready-for-pickup`);
  return data?.order;
}

export async function markCatalogOrderCompleted(id) {
  const { data } = await api.post(`/catalog/orders/${id}/complete`);
  return data?.order;
}

export async function fetchCatalogPackingSlipPdf(ids) {
  const list = Array.isArray(ids) ? ids : [ids];
  if (list.length === 1) {
    const { data } = await api.get(`/catalog/orders/${list[0]}/packing-slip.pdf`, {
      responseType: 'blob',
    });
    return data;
  }
  const { data } = await api.get('/catalog/orders/packing-slips.pdf', {
    params: { ids: list.join(',') },
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
