import test from 'node:test';
import assert from 'node:assert/strict';
import {foodPhoto} from './food-photos.js';
test('vælger fotos fra køkkentype og bruger neutralt foto ved manglende data',()=>{
  assert.equal(foodPhoto('pizza, italian').kind,'pizza');
  assert.equal(foodPhoto('BURGER').kind,'burger');
  assert.equal(foodPhoto('sushi').kind,'sushi');
  assert.equal(foodPhoto('coffee_shop').kind,'coffee');
  assert.equal(foodPhoto('Køkken ikke oplyst').kind,'neutral');
  assert.equal(foodPhoto(null).kind,'neutral');
});
test('eksterne køkkenoplysninger kan ikke indsætte en billedadresse',()=>{
  assert.equal(foodPhoto('javascript:alert(1)').kind,'neutral');
  assert.equal(new URL(foodPhoto('https://evil.example').url).hostname,'images.unsplash.com');
});
