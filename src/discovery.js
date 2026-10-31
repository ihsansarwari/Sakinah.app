export const categories = [
  {id:'all',label:'Alle steder',icon:'✦'},
  {id:'pizza',label:'Pizza',icon:'🍕'},
  {id:'burger',label:'Burger',icon:'🍔'},
  {id:'sushi',label:'Sushi',icon:'🍣'},
  {id:'middle-eastern',label:'Mellemøstligt',icon:'🧆'},
  {id:'indian',label:'Indisk',icon:'🍛'},
  {id:'asian',label:'Asiatisk',icon:'🍜'},
  {id:'cafe',label:'Café',icon:'☕'},
  {id:'danish',label:'Dansk',icon:'🥪'},
  {id:'other',label:'Andre køkkener',icon:'🍽️'}
];
export function matchesCategory(restaurant, category) {
  return category==='all' || (restaurant.categories || [restaurant.category || 'other']).includes(category);
}
export function evidenceSummary(restaurant, selected) {
  const keys=[...selected];
  const yes=keys.filter(key=>restaurant[key]===true).length;
  const no=keys.filter(key=>restaurant[key]===false).length;
  const unknown=keys.length-yes-no;
  if (!keys.length) return 'Se oplysninger om stedet';
  if (unknown===keys.length) return `Afventer oplysninger · ${unknown} ${unknown===1?'ukendt':'ukendte'}`;
  return `${yes} af ${keys.length} ønsker opfyldt${unknown?` · ${unknown} ${unknown===1?'ukendt':'ukendte'}`:''}`;
}
export function safeWebsite(value) {
  if (typeof value!=='string') return '';
  try {const url=new URL(value);return ['https:','http:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';} catch {return '';}
}
export function sortRestaurants(items, order='name', saved=new Set()) {
  const compare=(a,b)=>a.name.localeCompare(b.name,'da');
  const completeness=r=>['halal','alcohol','music','seating','prayer'].filter(key=>typeof r[key]==='boolean').length + ['website','phone','openingHours'].filter(key=>r[key]).length;
  return [...items].sort((a,b)=>order==='saved' ? Number(saved.has(b.id))-Number(saved.has(a.id)) || compare(a,b) : order==='information' ? completeness(b)-completeness(a) || compare(a,b) : compare(a,b));
}
export function readFavorites(storage) {
  try {const value=JSON.parse(storage.getItem('sakinah.favorites') || '[]');return new Set(Array.isArray(value)?value.filter(id=>typeof id==='string'):[]);} catch {return new Set();}
}
