import test from 'node:test';
import assert from 'node:assert/strict';
import {streetViewURL} from './street-view.js';
test('ingen eksterne fotoforespørgsler uden nøgle eller gyldige koordinater',()=>{
  assert.equal(streetViewURL({lat:55,lon:10},''),'');
  assert.equal(streetViewURL(null,'test'),'');
  assert.equal(streetViewURL({lat:999,lon:10},'test'),'');
});
test('Street View bruger koordinater, udendørsbilleder og fejlstatus ved manglende dækning',()=>{
  const url=new URL(streetViewURL({lat:55.4,lon:10.3},'test-key'));
  assert.equal(url.hostname,'maps.googleapis.com');
  assert.equal(url.searchParams.get('location'),'55.4,10.3');
  assert.equal(url.searchParams.get('source'),'outdoor');
  assert.equal(url.searchParams.get('return_error_code'),'true');
});
