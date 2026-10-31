export function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export function safeSourceURL(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'www.openstreetmap.org' && /^\/(node|way|relation)\/\d+$/.test(url.pathname) ? url.href : '';
  } catch { return ''; }
}
