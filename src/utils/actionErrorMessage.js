/** User-facing message when publish/go-live fails (e.g. trial ended). */
export function actionErrorMessage(err, fallback = 'Something went wrong') {
  const data = err?.response?.data;
  if (data?.code === 'subscription_required') {
    return `${data.message} Open Settings → Plan & billing to subscribe.`;
  }
  if (Array.isArray(data?.errors) && data.errors[0]) return data.errors[0];
  if (typeof data?.errors === 'object' && data.errors) {
    const first = Object.values(data.errors).flat()[0];
    if (first) return first;
  }
  return data?.message || fallback;
}
