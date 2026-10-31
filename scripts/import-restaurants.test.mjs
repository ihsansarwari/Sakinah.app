import test from 'node:test';
import assert from 'node:assert/strict';
import {convert} from './import-restaurants.mjs';
import {cuisineDetails, publicWebsite, validCoordinates, qualitySummary} from './restaurant-quality.mjs';

test('bevarer kilde og adskiller OSM halal-påstand fra verificeret status',()=>{
  const [r] = convert({elements:[{type:'node',id:123,tags:{name:'Testrestaurant',amenity:'restaurant','diet:halal':'yes','addr:city':'Odense'}}]},'2026-10-31T00:00:00Z');
  assert.equal(r.name,'Testrestaurant');
  assert.equal(r.reportedHalal,'yes');
  for (const key of ['halal','alcohol','music','seating','prayer']) assert.equal(r[key],null);
  assert.equal(r.source.url,'https://www.openstreetmap.org/node/123');
  assert.equal(r.source.importedAt,'2026-10-31T00:00:00Z');
  assert.equal(r.verification,'unverified');
});
test('udelukker unavngivne steder, andre faciliteter og dubletter med samme OSM-id',()=>{
  const item={type:'way',id:4,tags:{amenity:'cafe',name:'Eksempel'}};
  assert.equal(convert({elements:[item,item,{type:'node',id:5,tags:{amenity:'restaurant'}},{type:'node',id:6,tags:{amenity:'school',name:'Skole'}}]}).length,1);
});
test('afviser fejl og delvise svar frem for at overskrive data',()=>{
  assert.throws(()=>convert({remark:'timeout',elements:[]}));
  assert.throws(()=>convert({}));
});
test('bevarer rå køkkenoplysninger, mens læsevenlige kategorier oversættes',()=>{
  const value=cuisineDetails('pizza;burger;kebab','restaurant');
  assert.equal(value.cuisineRaw,'pizza;burger;kebab');
  assert.equal(value.cuisine,'Pizza, Burger, Kebab');
  assert.deepEqual(value.categories,['pizza','burger','middle-eastern']);
  assert.equal(value.category,'pizza');
  assert.equal(cuisineDetails(null,'cafe').category,'cafe');
  assert.equal(cuisineDetails(null,'restaurant').category,'other');
  // Unknown raw values stay visible instead of being silently reclassified.
  assert.equal(cuisineDetails('sci_lankan','restaurant').cuisine,'sci lankan');
});
test('bevarer kontaktoplysninger som uverificerede kildeoplysninger',()=>{
  const [r]=convert({osm3s:{timestamp_osm_base:'2026-10-31T00:00:00Z'},elements:[{type:'node',id:8,lat:55.4,lon:10.3,tags:{amenity:'restaurant',name:'Test','contact:website':'https://example.com','website:menu':'https://example.com/menu',phone:'+45 12345678',opening_hours:'Mo-Fr 10:00-18:00'}}]});
  assert.equal(r.website,'https://example.com/');assert.equal(r.menuUrl,'https://example.com/menu');
  assert.equal(r.openingHours,'Mo-Fr 10:00-18:00');assert.equal(r.phone,'+45 12345678');
  assert.equal(r.coordinateSource,'osm-node');assert.equal(r.source.snapshotAt,'2026-10-31T00:00:00Z');
  assert.equal(r.area,'Adresse ikke oplyst');assert.equal(r.city,'By ikke oplyst');
});
test('flagger nærliggende navnedubletter men fjerner aldrig forskellige OSM-poster',()=>{
  const element=(id,lat)=>({type:'node',id,lat,lon:10.3,tags:{amenity:'restaurant',name:'Samme navn'}});
  const list=convert({elements:[element(1,55.4),element(2,55.40001),element(3,55.5)]});
  assert.equal(list.length,3);
  assert.deepEqual(list[0].duplicateCandidates,['osm-node-2']);
  assert.deepEqual(list[2].duplicateCandidates,[]);
});
test('afviser aktive links, URL-legitimationsoplysninger og ugyldige koordinater',()=>{
  assert.equal(publicWebsite('javascript:alert(1)'),null);
  assert.equal(publicWebsite('https://user:password@example.com'),null);
  assert.equal(validCoordinates({lat:999,lon:10}),null);
  assert.deepEqual(validCoordinates({center:{lat:55.4,lon:10.3}}),{lat:55.4,lon:10.3});
});
test('kvalitetsrapport tæller kun eksplicit verificeret halal, ikke kildepåstande',()=>{
  const records=[
    {halal:true,verification:'unverified'},
    {halal:true,verification:'verified'},
    {halal:null,verification:'verified'},
    {halal:false,verification:'verified'}
  ];
  assert.equal(qualitySummary(records).verifiedHalal,1);
});
