import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {cuisineDetails, publicWebsite, validCoordinates, markDuplicateCandidates, qualitySummary} from './restaurant-quality.mjs';

export function convert(payload, importedAt = new Date().toISOString()) {
  if (!payload || !Array.isArray(payload.elements) || payload.remark) throw new Error('Ufuldstændigt eller ugyldigt Overpass-svar; eksisterende data bevares.');
  const seen = new Set();
  const restaurants = payload.elements.flatMap(element => {
    const t = element.tags || {};
    if (!['restaurant','fast_food','cafe'].includes(t.amenity) || !t.name?.trim() || !['node','way','relation'].includes(element.type) || !Number.isSafeInteger(element.id)) return [];
    // This supermarket is incorrectly tagged fast_food in the source snapshot.
    // Keep actual eateries such as Bilka Bistro; do not filter by chain name.
    if (element.type === 'node' && element.id === 13116975572) return [];
    if (['supermarket','convenience','grocery'].includes(t.shop)) return [];
    const id = `osm-${element.type}-${element.id}`;
    if (seen.has(id)) return [];
    seen.add(id);
    return [{
      id, name:t.name.trim(), city:t['addr:city'] || 'By ikke oplyst',
      coordinates:validCoordinates(element),
      coordinateSource:validCoordinates(element) ? element.type==='node' ? 'osm-node' : 'osm-object-center' : null,
      area:[t['addr:street'],t['addr:housenumber']].filter(Boolean).join(' ') || 'Adresse ikke oplyst',
      ...cuisineDetails(t.cuisine,t.amenity), price:'Pris ikke oplyst',
      amenity:t.amenity,
      website:publicWebsite(t.website || t['contact:website']),
      menuUrl:publicWebsite(t['website:menu'] || t['contact:menu']),
      phone:typeof (t.phone || t['contact:phone'])==='string' ? (t.phone || t['contact:phone']).trim() : null,
      openingHours:typeof t.opening_hours==='string' ? t.opening_hours : null,
      businessUnitReference:typeof t['ref:DK:cvr:pnummer']==='string' ? t['ref:DK:cvr:pnummer'] : null,
      icon:'◒', color:'olive', description:'Grundoplysninger fra OpenStreetMap. Restaurantens aktuelle forhold er ikke kontrolleret af GOOD.',
      halal:null, alcohol:null, music:null, seating:null, prayer:null,
      source:{name:'OpenStreetMap',url:`https://www.openstreetmap.org/${element.type}/${element.id}`,license:'ODbL 1.0',importedAt,
        snapshotAt:payload.osm3s?.timestamp_osm_base || null,
        reportedCheckDate:typeof t.check_date==='string' ? t.check_date : null},
      reportedHalal:t['diet:halal'] || null,
      photoReference: typeof t.wikimedia_commons === 'string' && t.wikimedia_commons.startsWith('File:')
        ? `https://commons.wikimedia.org/wiki/${encodeURIComponent(t.wikimedia_commons)}` : null,
      verification:'unverified'
    }];
  });
  return markDuplicateCandidates(restaurants);
}

async function main() {
  const args = process.argv.slice(2);
  const inputIndex = args.indexOf('--input');
  const outputIndex = args.indexOf('--output');
  const output = outputIndex >= 0 ? args[outputIndex + 1] : 'data/restaurants.osm.json';
  if (!output || (inputIndex >= 0 && !args[inputIndex + 1])) throw new Error('Brug --input fil.json og/eller --output fil.json.');
  let payload;
  if (inputIndex >= 0) payload = JSON.parse(await readFile(args[inputIndex + 1], 'utf8'));
  else {
    // Start with a bounded Odense sample rather than an expensive nationwide request.
    const query = '[out:json][timeout:35];nwr["amenity"~"^(restaurant|fast_food|cafe)$"]["name"](55.33,10.25,55.46,10.52);out center body;';
    // curl preserves the managed environment's HTTPS proxy and CA configuration.
    const {stdout} = await promisify(execFile)('curl',[
      '--fail','--silent','--show-error','--max-time','50',
      '--user-agent','GOODPrototype/0.1',
      '--data-urlencode',`data=${query}`,
      'https://overpass-api.de/api/interpreter'
    ],{maxBuffer:20 * 1024 * 1024,timeout:55000});
    payload = JSON.parse(stdout);
  }
  const restaurants = convert(payload);
  if (!restaurants.length) throw new Error('Ingen brugbare restauranter; eksisterende data bevares.');
  const destination = resolve(output);
  await mkdir(dirname(destination), {recursive:true});
  await writeFile(destination + '.tmp', JSON.stringify({
    attribution:'© OpenStreetMap contributors',
    license:'https://opendatacommons.org/licenses/odbl/1-0/',
    source:'https://www.openstreetmap.org/copyright',
    scope:'Uverificerede grundoplysninger. Ingen garanti for fuldstændighed eller halal-status.',
    queryArea:{name:'Odense-området',bbox:[55.33,10.25,55.46,10.52],administrativeBoundary:false},
    quality:qualitySummary(restaurants),
    restaurants
  }, null, 2) + '\n');
  await rename(destination + '.tmp', destination);
  console.log(`${restaurants.length} restaurantposter gemt i ${output}. Halal og øvrige kriterier er ukendte indtil verificering.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
