// Curated Unsplash illustrations. These are not photos of the restaurants.
// Direct image URLs: no Google billing, API key, tracking query, or random endpoint.
const photos = {
  pizza: {id:'1513104890138-7c749659a591',alt:'Pizza — illustrationsfoto'},
  burger: {id:'1568901346375-23c9450c58cd',alt:'Burger — illustrationsfoto'},
  sushi: {id:'1579871494447-9811cf80d66c',alt:'Sushi — illustrationsfoto'},
  indian: {id:'1603894584373-5ac82b2ae398',alt:'Curryret — illustrationsfoto'},
  coffee: {id:'1442512595331-e89e73853f31',alt:'Kaffe — illustrationsfoto'},
  neutral: {id:'1512621776951-a57141f2eefd',alt:'Grøntsagsret — generelt illustrationsfoto'}
};
export function foodPhoto(cuisine='') {
  const value=String(cuisine).toLowerCase();
  const kind=/pizza|italian/.test(value)?'pizza':/burger/.test(value)?'burger':/sushi|japanese/.test(value)?'sushi':/indian|pakistani/.test(value)?'indian':/coffee|cafe|café/.test(value)?'coffee':'neutral';
  const photo=photos[kind];
  return {...photo,kind,url:`https://images.unsplash.com/photo-${photo.id}?auto=format&fit=crop&w=800&q=80`};
}
