export function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export function safeSourceURL(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'www.openstreetmap.org' && /^\/(node|way|relation)\/\d+$/.test(url.pathname) ? url.href : '';
  } catch { return ''; }
}
export function mapLinks(coordinates) {
  if (!coordinates || !Number.isFinite(coordinates.lat) || !Number.isFinite(coordinates.lon) || Math.abs(coordinates.lat)>85 || Math.abs(coordinates.lon)>180) return null;
  const {lat,lon} = coordinates;
  const query = new URLSearchParams({bbox:`${lon-.004},${lat-.0025},${lon+.004},${lat+.0025}`,layer:'mapnik',marker:`${lat},${lon}`});
  return {
    embed:`https://www.openstreetmap.org/export/embed.html?${query}`,
    full:`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`,
    directions:`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`
  };
}
export function safePhotoReference(value) {
  try {
    const url = new URL(value);
    return url.protocol==='https:' && url.hostname==='commons.wikimedia.org' && url.pathname.startsWith('/wiki/File%3A') ? url.href : '';
  } catch { return ''; }
}
