import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {partitionCatalog,reviewReason} from './catalog-scope.mjs';
test('review preserves uncertain records without interpreting halal or deleting candidates',()=>{
 const records=[{id:'a',name:'4050 SDU - Near By Coffee 1',amenity:'cafe'}, {id:'b',name:'Blommenslyst Kro',amenity:'restaurant'}, {id:'c',name:'Café med frokost',amenity:'cafe',cuisineRaw:'coffee_shop;sandwich'}, {id:'d',name:'Pizza',amenity:'fast_food',halal:null}, {id:'e',name:'Mulig dublet',duplicateCandidates:['d']}];
 const {restaurants,reviewRestaurants}=partitionCatalog(records);
 assert.deepEqual(restaurants.map(r=>r.id),['c','d']);
 assert.deepEqual(reviewRestaurants.map(r=>r.id),['a','b','e']);
 assert.equal(restaurants[1].halal,null);
 assert.equal(reviewRestaurants[2].duplicateCandidates[0],'d');
 assert.deepEqual(partitionCatalog([...restaurants,...reviewRestaurants]),{restaurants,reviewRestaurants});
});
test('coffee and dessert signals never override an explicitly listed meal',()=>{
 assert.ok(reviewReason({name:'Kaffe',amenity:'cafe',cuisineRaw:'coffee_shop'}));
 assert.equal(reviewReason({name:'Café',amenity:'cafe',cuisineRaw:'coffee_shop;burger'}),null);
 assert.equal(reviewReason({name:'Bar tapas',amenity:'restaurant',cuisineRaw:'tapas'}),null);
 assert.ok(reviewReason({name:'Pub',amenity:'restaurant'}));
});
test('catalog partitions retain all 425 records with distinct ids and explicit review reasons',async()=>{
 const d=JSON.parse(await readFile(new URL('../data/restaurants.osm.json',import.meta.url)));
 const all=[...d.restaurants,...d.reviewRestaurants];
 assert.equal(all.length,425);assert.equal(new Set(all.map(r=>r.id)).size,425);
 assert.ok(d.reviewRestaurants.every(r=>r.reviewReason && r.source.url));
 assert.ok(d.restaurants.every(r=>!reviewReason(r)));
 assert.ok(d.reviewRestaurants.some(r=>r.id==='osm-node-12893808585'));
 assert.ok(d.reviewRestaurants.some(r=>r.name==='Blommenslyst Kro'));
});
