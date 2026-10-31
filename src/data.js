// Fiktive eksempler, aldrig vurderinger af virkelige restauranter.
export const criteria = [
  {key:'halal', label:'Halal-kød', short:'Halal-kød', explanation:'Oplysninger om kødets oprindelse og halal-dokumentation.'},
  {key:'alcohol', label:'Ingen alkoholservering', short:'Uden alkohol', explanation:'Om stedet serverer alkohol. Alkohol i mad skal undersøges særskilt.'},
  {key:'music', label:'Ingen baggrundsmusik', short:'Uden musik', explanation:'Om der normalt spilles musik. Det kan variere over dagen.'},
  {key:'seating', label:'Mulighed for afskærmet siddeområde', short:'Afskærmet område', explanation:'Mulighed for privat eller afskærmet plads. Bekræft indretning og ledighed med stedet.'},
  {key:'prayer', label:'Mulighed for bøn', short:'Plads til bøn', explanation:'Om der kan stilles et egnet sted til rådighed for bøn.'}
];
export const restaurants = [
  {id:1,name:'Oliven & Safran',city:'København',area:'Nørrebro',cuisine:'Mellemøstligt',price:'$$',icon:'◒',color:'olive',description:'Et fiktivt eksempel på et afslappet spisested med varme retter og plads til familien.',halal:true,alcohol:true,music:false,seating:true,prayer:null},
  {id:2,name:'Det Grønne Bord',city:'Aarhus',area:'Aarhus C',cuisine:'Moderne dansk',price:'$$',icon:'✳',color:'sage',description:'Et fiktivt eksempel med sæsonens grøntsager, enkle retter og rolige omgivelser.',halal:null,alcohol:true,music:true,seating:false,prayer:null},
  {id:3,name:'Maison Dadel',city:'Odense',area:'Centrum',cuisine:'Marokkansk',price:'$$$',icon:'✺',color:'terracotta',description:'Et fiktivt eksempel på et familiedrevet spisested inspireret af det marokkanske køkken.',halal:true,alcohol:true,music:true,seating:true,prayer:true},
  {id:4,name:'Sesam & Ild',city:'København',area:'Vesterbro',cuisine:'Tyrkisk',price:'$',icon:'◈',color:'sand',description:'Et fiktivt eksempel med grillretter, friskbagt brød og en uformel atmosfære.',halal:true,alcohol:false,music:false,seating:null,prayer:false},
  {id:5,name:'Kardemomme Køkken',city:'Aalborg',area:'Vestbyen',cuisine:'Pakistansk',price:'$$',icon:'❋',color:'rose',description:'Et fiktivt eksempel med krydrede klassikere, fællesretter og familiepladser.',halal:true,alcohol:true,music:null,seating:true,prayer:null},
  {id:6,name:'Lille Levant',city:'Aarhus',area:'Trøjborg',cuisine:'Libanesisk',price:'$',icon:'❖',color:'blue',description:'Et fiktivt eksempel på et lille køkken med mezze, friske salater og lune pitabrød.',halal:true,alcohol:true,music:true,seating:false,prayer:false}
];
export function match(restaurant, selected) {
  const keys = [...selected];
  return { matched:keys.filter(key=>restaurant[key] === true).length, total:keys.length, unknown:keys.filter(key=>restaurant[key] === null).length };
}
export function filterRestaurants(items, {query='', city='', selected=new Set(), strict=false}={}) {
  return items.filter(r => (!city || r.city===city) && `${r.name} ${r.city} ${r.area} ${r.cuisine}`.toLocaleLowerCase('da').includes(query.toLocaleLowerCase('da')) && (!strict || [...selected].every(key=>r[key]===true)));
}
