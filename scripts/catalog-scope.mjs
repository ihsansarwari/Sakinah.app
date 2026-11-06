// Editorial discovery scope, independent of halal status. Review records are
// retained with source data; a name/category signal is not proof of closure,
// restricted access, duplication or lack of halal options.
const mealCuisines = new Set(['burger','tapas','brunch','breakfast','regional','danish','sandwich','salad','pizza','pasta','italian','mexican','vietnamese','indian','thai','seafood','smørrebrød']);
export function reviewReason(r) {
  if (r.lifecycle === 'closed') return 'Kilden markerer stedet som lukket; afventer kontrol.';
  if (['private','no'].includes(r.access)) return 'Adgangen er begrænset i kilden; offentlig adgang skal afklares.';
  if (['supermarket','convenience','grocery','kiosk'].includes(r.shop)) return 'Butik; ikke en del af spisestedspiloten.';
  if (/\b(sdu|kantine|plejecenter|dagcenter|college|business park|forskerparker|compass group|orifarm|energi fyn|meneta|designakademi|marketenderi|idrætshal|skøjtehal|golfklub|eventyrgolf|legeland|jumping fun|squash future)\b|hallens|hallernes|hallen\b|sportscafe/i.test(r.name)) return 'Institution, arbejdsplads eller aktivitetssted; adgang og måltider skal afklares.';
  if (/\bkro\b|kroen|hotel/i.test(r.name)) return 'Kro eller hotelprofil; restauranttilbud og relevans skal afklares.';
  if (r.duplicateCandidates?.length) return 'Mulig dublet i kilden; posterne skal sammenholdes manuelt.';
  const cuisines=(r.cuisineTags || (r.cuisineRaw||'').split(';')).map(c=>c.toLowerCase().trim());
  const hasMeals=cuisines.some(c=>mealCuisines.has(c));
  if (!hasMeals && (/\bbar\b|pub\b|natklub|beer.*lab|papbar/i.test(r.name))) return 'Barpræget navn; egentligt måltidstilbud skal afklares.';
  if (cuisines.length && cuisines.filter(Boolean).length && cuisines.every(c=>['coffee_shop','tea','bubble_tea','dessert','donut','ice_cream','pancake','cake','pie'].includes(c))) return 'Kun kaffe, drikke eller dessert oplyst; måltidstilbud skal afklares.';
  if (r.amenity === 'cafe' && !hasMeals) return 'Café uden oplyst måltidstilbud; afventer gennemgang.';
  if (/sweet.*dessert|vorforvaffel|isværket|kaffebar/i.test(r.name) && !hasMeals) return 'Kaffe- eller dessertpræget sted; måltidstilbud skal afklares.';
  return null;
}
export function partitionCatalog(records) {
  const restaurants=[], reviewRestaurants=[];
  for(const record of records) {
    const {reviewReason:previousReason,...r}=record;
    const reason=reviewReason(r);
    if(reason) reviewRestaurants.push({...r,reviewReason:reason});
    else restaurants.push(r);
  }
  return {restaurants,reviewRestaurants};
}
