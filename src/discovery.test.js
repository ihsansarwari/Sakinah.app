import test from 'node:test';
import assert from 'node:assert/strict';
import {matchesCategory,evidenceSummary,safeWebsite,sortRestaurants,readFavorites} from './discovery.js';
test('ukendte oplysninger fremstilles aldrig som en negativ halal-vurdering',()=>{
  assert.equal(evidenceSummary({halal:null,alcohol:null},new Set(['halal','alcohol'])),'Afventer oplysninger · 2 ukendte');
  assert.match(evidenceSummary({halal:true,alcohol:null},new Set(['halal','alcohol'])),/1 af 2 ønsker opfyldt · 1 ukendt/);
});
test('flere køkkentyper kan findes og sortering ændrer ikke input',()=>{
  assert.ok(matchesCategory({categories:['pizza','burger']},'burger'));
  const input=[{id:'a',name:'Zulu'},{id:'b',name:'Alfa'}];
  assert.deepEqual(sortRestaurants(input).map(x=>x.id),['b','a']);
  assert.equal(input[0].id,'a');
  assert.equal(sortRestaurants(input,'saved',new Set(['a']))[0].id,'a');
});
test('favoritter tåler utilgængelig eller ugyldig browserlagring',()=>{
  assert.equal(readFavorites({getItem(){throw Error('blocked')}}).size,0);
  assert.equal(readFavorites({getItem(){return '{bad json'}}).size,0);
  assert.deepEqual([...readFavorites({getItem(){return '["osm-node-1",42]'}})],['osm-node-1']);
});
test('kontaktlinks afviser kode og indlejrede credentials',()=>{
  assert.equal(safeWebsite('javascript:alert(1)'), '');
  assert.equal(safeWebsite('https://user:password@example.com'),'');
  assert.equal(safeWebsite('https://example.com/menu'),'https://example.com/menu');
});
