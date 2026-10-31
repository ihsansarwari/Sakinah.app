import test from 'node:test';
import assert from 'node:assert/strict';
import {convert} from './import-restaurants.mjs';

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
