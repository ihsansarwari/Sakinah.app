import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {escapeHTML,safeSourceURL} from './catalog.js';
test('restaurantnavne og kildelinks kan ikke indsætte aktiv HTML',()=>{
  assert.equal(escapeHTML('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.equal(safeSourceURL('javascript:alert(1)'), '');
  assert.equal(safeSourceURL('https://www.openstreetmap.org.evil.example/node/1'), '');
  assert.equal(safeSourceURL('https://www.openstreetmap.org/node/1'),'https://www.openstreetmap.org/node/1');
});
test('det importerede katalog har unikke kilde-id’er og ingen udokumenterede vurderinger',async()=>{
  const {restaurants,attribution,license}=JSON.parse(await readFile(new URL('../data/restaurants.osm.json',import.meta.url),'utf8'));
  assert.ok(restaurants.length>0);
  assert.equal(new Set(restaurants.map(r=>r.id)).size,restaurants.length);
  assert.match(attribution,/OpenStreetMap/);assert.match(license,/odbl/);
  for(const r of restaurants) {
    assert.ok(r.name);assert.ok(safeSourceURL(r.source.url));assert.ok(Number.isFinite(Date.parse(r.source.importedAt)));
    for(const key of ['halal','alcohol','music','seating','prayer']) assert.equal(r[key],null);
  }
});
