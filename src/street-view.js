export function streetViewURL(coordinates, key) {
  if (!key?.trim() || !coordinates || !Number.isFinite(coordinates.lat) || !Number.isFinite(coordinates.lon) || Math.abs(coordinates.lat)>85 || Math.abs(coordinates.lon)>180) return '';
  const query = new URLSearchParams({
    size:'640x400', location:`${coordinates.lat},${coordinates.lon}`,
    fov:'80', pitch:'0', radius:'30', source:'outdoor', return_error_code:'true', key:key.trim()
  });
  return `https://maps.googleapis.com/maps/api/streetview?${query}`;
}
