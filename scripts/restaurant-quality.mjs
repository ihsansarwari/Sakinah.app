const cuisineLabels = {
  african:'Afrikansk', arab:'Arabisk', asian:'Asiatisk', bagel:'Bagels', breakfast:'Morgenmad', brunch:'Brunch',
  bubble_tea:'Bubble tea', burger:'Burger', american:'Amerikansk', chicken:'Kyllingeretter', chinese:'Kinesisk',
  coffee_shop:'Kaffe og café', danish:'Dansk', dessert:'Dessert', donut:'Donuts', french:'Fransk', fried_chicken:'Friteret kylling',
  gourmet:'Gourmet', greek:'Græsk', hot_dog:'Hotdogs', indian:'Indisk', international:'Internationalt', italian:'Italiensk',
  italian_pizza:'Italiensk pizza', japanese:'Japansk', kebab:'Kebab', korean:'Koreansk', lebanese:'Libanesisk', local:'Lokalt køkken',
  mexican:'Mexicansk', middle_eastern:'Mellemøstligt', oriental:'Orientalsk', pancake:'Pandekager', panini:'Panini',
  pasta:'Pasta', pie:'Tærter', pita:'Pita', pizza:'Pizza', poke:'Poké', ramen:'Ramen', regional:'Regionalt køkken',
  salad:'Salater', sandwich:'Sandwich', seafood:'Fisk og skaldyr', shawarma:'Shawarma', 'smørrebrød':'Smørrebrød',
  steak:'Steak', steak_house:'Steakhouse', sushi:'Sushi', swedish:'Svensk', syrian:'Syrisk', tapas:'Tapas', tea:'Te',
  thai:'Thailandsk', turkish:'Tyrkisk', vietnamese:'Vietnamesisk'
};
const categoryByCuisine = {
  pizza:'pizza', italian_pizza:'pizza', burger:'burger', sushi:'sushi', indian:'indian',
  arab:'middle-eastern', kebab:'middle-eastern', lebanese:'middle-eastern', middle_eastern:'middle-eastern',
  pita:'middle-eastern', shawarma:'middle-eastern', syrian:'middle-eastern', turkish:'middle-eastern',
  asian:'asian', chinese:'asian', japanese:'asian', korean:'asian', ramen:'asian', thai:'asian', vietnamese:'asian',
  coffee_shop:'cafe', brunch:'cafe', breakfast:'cafe', tea:'cafe', danish:'danish', 'smørrebrød':'danish'
};
export const categoryLabels = {
  pizza:'Pizza', burger:'Burger', sushi:'Sushi', indian:'Indisk', 'middle-eastern':'Mellemøstligt',
  asian:'Asiatisk', cafe:'Café og brunch', danish:'Dansk', other:'Øvrige'
};

export function cuisineDetails(raw, amenity) {
  const cuisineRaw = typeof raw === 'string' && raw.trim() ? raw.trim() : null;
  const cuisineTags = cuisineRaw ? [...new Set(cuisineRaw.split(';').map(s=>s.trim()).filter(Boolean))] : [];
  const categories = [...new Set(cuisineTags.map(tag=>categoryByCuisine[tag.toLowerCase()]).filter(Boolean))];
  if (!categories.length) categories.push(amenity==='cafe' ? 'cafe' : 'other');
  return {
    cuisineRaw, cuisineTags,
    cuisine:cuisineTags.map(tag=>cuisineLabels[tag.toLowerCase()] || tag.replaceAll('_',' ')).join(', ') || 'Køkken ikke oplyst',
    category:categories[0], categories, categoryLabel:categoryLabels[categories[0]]
  };
}

export function publicWebsite(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (!['http:','https:'].includes(url.protocol) || url.username || url.password) return null;
    return url.href;
  } catch { return null; }
}

export function validCoordinates(element) {
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  return Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat)<=90 && Math.abs(lon)<=180 ? {lat,lon} : null;
}

function metres(a,b) {
  const radians = Math.PI/180;
  const dlat=(a.lat-b.lat)*radians, dlon=(a.lon-b.lon)*radians;
  const h=Math.sin(dlat/2)**2 + Math.cos(a.lat*radians)*Math.cos(b.lat*radians)*Math.sin(dlon/2)**2;
  return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
}

// Never merge branches or similarly named businesses automatically. A matching
// business-unit reference or same name within 25 m only requests human review.
export function markDuplicateCandidates(restaurants) {
  const result=restaurants.map(r=>({...r,duplicateCandidates:[]}));
  for (let i=0;i<result.length;i++) for (let j=i+1;j<result.length;j++) {
    const a=result[i], b=result[j];
    const sameUnit=a.businessUnitReference && a.businessUnitReference===b.businessUnitReference;
    const sameName=a.name.normalize('NFKC').toLocaleLowerCase('da')===b.name.normalize('NFKC').toLocaleLowerCase('da');
    if (sameUnit || (sameName && a.coordinates && b.coordinates && metres(a.coordinates,b.coordinates)<=25)) {
      a.duplicateCandidates.push(b.id);b.duplicateCandidates.push(a.id);
    }
  }
  return result;
}

export function qualitySummary(restaurants) {
  const hasAddress=r=>r.area && r.area!=='Adresse ikke oplyst';
  return {
    total:restaurants.length,
    withCuisine:restaurants.filter(r=>r.cuisineRaw).length,
    withAddress:restaurants.filter(hasAddress).length,
    withCity:restaurants.filter(r=>r.city!=='By ikke oplyst').length,
    withCoordinates:restaurants.filter(r=>r.coordinates).length,
    withWebsite:restaurants.filter(r=>r.website).length,
    withMenu:restaurants.filter(r=>r.menuUrl).length,
    withPhone:restaurants.filter(r=>r.phone).length,
    withOpeningHours:restaurants.filter(r=>r.openingHours).length,
    requiringDuplicateReview:restaurants.filter(r=>r.duplicateCandidates?.length).length,
    verifiedHalal:restaurants.filter(r=>r.verification==='verified' && r.halal===true).length,
    categories:Object.fromEntries(Object.keys(categoryLabels).map(key=>[key,restaurants.filter(r=>r.category===key).length]))
  };
}
