import test from 'node:test';
import assert from 'node:assert/strict';
import {restaurants, match, filterRestaurants} from './data.js';
test('søgning finder køkken uafhængigt af store bogstaver og respekterer by',()=>{
  assert.deepEqual(filterRestaurants(restaurants,{query:'LIBANESISK',city:'Aarhus'}).map(r=>r.id),[6]);
  assert.equal(filterRestaurants(restaurants,{query:'LIBANESISK',city:'Odense'}).length,0);
});
test('fulde match udelukker både nej og ukendt',()=>{
  const items=filterRestaurants(restaurants,{selected:new Set(['halal','prayer']),strict:true});
  assert.deepEqual(items.map(r=>r.id),[3]);
});
test('ukendte kriterier tæller ikke som opfyldt',()=>{
  assert.deepEqual(match(restaurants[0],new Set(['halal','music','prayer'])),{matched:1,total:3,unknown:1});
  assert.deepEqual(match(restaurants[0],new Set()),{matched:0,total:0,unknown:0});
});
