import {categories, matchesCategory, evidenceSummary, safeWebsite, sortRestaurants, readFavorites} from './discovery.js';
import {foodPhoto} from './food-photos.js';
import {criteria, filterRestaurants} from './data.js';
import {escapeHTML as esc, safeSourceURL, mapLinks, safePhotoReference} from './catalog.js';
const arrow = '<svg class="icon-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>';
let restaurants = [];
let loadError = false;
try {
  const response = await fetch('./data/restaurants.osm.json');
  if (!response.ok) throw new Error('Data kunne ikke indlæses');
  const catalog = await response.json();
  if (!Array.isArray(catalog.restaurants)) throw new Error('Ugyldigt katalog');
  restaurants = catalog.restaurants;
} catch { loadError = true; }
const selected = new Set(['halal','alcohol']);
let saved;
try { saved = readFavorites(window.localStorage); } catch { saved = new Set(); }
saved = new Set([...saved].filter(id=>restaurants.some(r=>r.id===id)));
let category = 'all';
const documented = restaurants.filter(r=>r.halal===true && r.verification==='verified').length;
const app = document.querySelector('#app');
app.innerHTML = `
<header><a class="brand" href="./" aria-label="GOOD · Tayyibah, forsiden"><img class="brand-logo" src="./assets/good-logo.png" alt="GOOD · طيّبة" width="216" height="72"></a><nav aria-label="Hovednavigation"><a href="#explore">Find spisesteder</a><a href="#principles">Sådan læses rapporten</a></nav><span class="demo-badge">Odense · Tidlig version</span></header>
<main><section class="hero"><div class="hero-copy"><p class="eyebrow"><span></span> طيّبة · TAYYIBAH · GOOD</p><h1>God mad.<br><em>Godt at vide.</em></h1><p class="intro">Find dit næste spisested i Odense.<br>Læs rapporten om mad og rammer — og se, hvad oplysningerne bygger på.</p><a class="primary" href="#explore">Find dit næste spisested <span>${arrow}</span></a><div class="hero-note"><span>✧</span> Din restaurant. Din rapport. Dit valg.</div><div class="hero-stats"><span><strong>${restaurants.length}</strong> spisesteder at udforske</span><span><strong>5</strong> personlige kriterier</span></div></div><div class="hero-art" aria-hidden="true"><div class="arch"><div class="sun"></div><div class="stem stem-one"></div><div class="stem stem-two"></div><div class="plate"><div class="food food-one"></div><div class="food food-two"></div><div class="food food-three"></div><div class="herb">✳</div></div><div class="napkin"></div><div class="glass"></div></div><div class="art-label"><span>✧</span><div>Plads til det, der betyder noget<small>Mad · Omgivelser · Tryghed</small></div></div><span class="art-caption">ET MÅLTID ER MERE END MADEN</span></div></section>
<section class="values-strip" aria-label="Vores tilgang"><span>◎ Mad og rammer</span><span>✧ Kilder bag oplysningerne</span><span>${arrow} Dit valg, på oplyst grundlag</span></section>
<section id="explore" class="explore"><div class="section-heading"><div><p class="eyebrow">FIND DIT STED</p><h2>Hvad har du lyst til?</h2></div><p>Find smagen først.<br>Undersøg rammerne bagefter.</p></div>
<div class="category-tabs" role="group" aria-label="Vælg køkken">${categories.map(c=>`<button class="category-chip ${c.id===category?'active':''}" type="button" data-category="${c.id}" aria-pressed="${c.id===category}"><span aria-hidden="true">${c.icon}</span>${c.label}</button>`).join('')}</div><div class="search-bar"><label><span class="sr-only">Søg efter navn, køkken eller område</span><span aria-hidden="true">⌕</span><input id="query" type="search" placeholder="Søg efter navn, køkken eller område…"></label><label class="city-label"><span aria-hidden="true">⌖</span><span class="sr-only">By</span><select id="city"><option value="">Odense-området</option>${[...new Set(restaurants.map(r=>r.city))].filter(c=>c!=="By ikke oplyst").map(c=>`<option>${esc(c)}</option>`).join('')}</select></label></div>
<fieldset class="preferences"><legend>Dine præferencer</legend>${criteria.map(c=>`<label class="chip"><input type="checkbox" value="${c.key}" ${selected.has(c.key)?'checked':''}><span>${c.label}</span></label>`).join('')}</fieldset>
<div class="catalog-controls"><label class="saved-toggle"><input id="saved-only" type="checkbox"> Favoritter på denne enhed <span id="saved-count">${saved.size}</span></label><span id="saved-message" role="status"></span><label class="sort-control">Sortér efter <select id="sort"><option value="name">Navn A–Å</option><option value="information">Flest oplysninger</option><option value="saved">Favoritter først</option></select></label></div><div class="trust-summary" aria-label="Status på oplysninger"><div><strong>${restaurants.length}</strong><span>steder i Odense-området</span></div><div><strong>${documented}</strong><span>med verificeret halal-status</span></div><div><strong>Dit valg</strong><span>hver oplysning vises særskilt</span></div></div><div class="results-toolbar"><p id="count" role="status"></p><label class="strict"><input id="strict" type="checkbox"> Vis kun fulde match</label></div><div class="demo-notice"><span>ⓘ</span> Udvalgt udsnit af OpenStreetMap. Interne steder, kaffe- og dessertsteder uden oplyste måltider samt usikre poster er sat til gennemgang. Manglende oplysninger er ikke et nej. Halal-status og øvrige kriterier er ikke verificeret. Oversigten er ikke en liste over godkendte halal-restauranter.</div><div id="results" class="grid"></div></section>
<section id="principles" class="principles"><p class="eyebrow">SÅDAN LÆSES EN GOOD-RAPPORT</p><h2>Godt at vide, før du vælger.</h2><p>Mad, alkohol, musik, afskærmning og mulighed for bøn vises hver for sig. En bekræftet profil betyder, at restaurantens tilknytning og deltagelse er bekræftet. Det er ikke en halal-certificering.</p><div class="principle-grid"><article><span>01 · RESTAURANTEN</span><h3>Oplyst af restauranten</h3><p>Restaurantens egne svar skal vise dato og omfang. Samtykke til en profil er ikke dokumentation for svarene.</p></article><article><span>02 · GÆSTERNE</span><h3>Observeret af brugere</h3><p>Observationer skal vise besøgsdato og kildegrundlag. De holdes adskilt fra restaurantens svar; uenighed kræver afklaring.</p></article><article><span>03 · DOKUMENTATION</span><h3>Materiale gennemgået</h3><p>Det skal fremgå, hvilket materiale der er gennemgået, hvornår og for hvilke retter eller forhold. Et leverandørcertifikat dækker ikke automatisk hele stedet.</p></article></div></section><section class="principles restaurant-participation" id="for-restaurants"><p class="eyebrow">FRA DØREN TIL OPLYSNINGERNE</p><h2>Én restaurant. Én rapport. Ét link.</h2><p>Et klistermærke med “Se vores GOOD-rapport” kan føre gæster direkte til restaurantens profil via en QR-kode. Alle profiler har nu et fast link, der kan bruges i en QR-kode.</p><div class="principle-grid"><article><span>FOR GÆSTER</span><h3>Læs før du vælger</h3><p>Se hvert kriterium og dets grundlag. Ukendt er hverken et ja eller et nej.</p></article><article><span>FOR RESTAURANTER</span><h3>Bidrag til jeres profil</h3><p>Indsendelse, bekræftelse af ejerskab og håndtering af rettelser er næste trin. Der modtages endnu ikke svar via siden.</p></article><article><span>VORES PRINCIP</span><h3>Troværdighed kan ikke købes</h3><p>Betaling må aldrig give en positiv vurdering. Katalogets nuværende profiler kommer fra OpenStreetMap og er ikke bekræftet af restauranterne.</p></article></div></section></main><footer><a class="brand" href="./" aria-label="GOOD · Tayyibah, forsiden"><img class="brand-logo" src="./assets/good-logo.png" alt="GOOD · طيّبة" width="216" height="72"></a><p>Madfotos: <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a> · Illustrationsfotos</p><span><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a> · <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noopener noreferrer">ODbL</a></span></footer><dialog id="detail"><button class="close" aria-label="Luk restaurantprofil">×</button><div id="detail-content"></div></dialog>`;
let visibleLimit = 24;
const results = document.querySelector('#results');
const statusLabel = value => value===true?'Ja':value===false?'Nej':'Ukendt';
function render() {
  const filtered = filterRestaurants(restaurants,{query:document.querySelector('#query').value,city:document.querySelector('#city').value,selected,strict:document.querySelector('#strict').checked}).filter(r=>matchesCategory(r,category) && (!document.querySelector('#saved-only').checked || saved.has(r.id)));
  const items = sortRestaurants(filtered,document.querySelector('#sort').value,saved);
  document.querySelector('#saved-count').textContent = saved.size;
  document.querySelectorAll('[data-category]').forEach(button=>{button.setAttribute('aria-pressed',button.dataset.category===category);button.classList.toggle('active',button.dataset.category===category);});
  document.querySelector('#count').textContent=`${items.length} spisesteder · ${selected.size} valgte kriterier`;
  results.innerHTML = items.length ? items.slice(0,visibleLimit).map(r=>{return `<article class="restaurant"><div class="card-photo"><button class="favorite-button ${saved.has(r.id)?'is-saved':''}" type="button" data-favorite="${esc(r.id)}" aria-pressed="${saved.has(r.id)}" aria-label="${saved.has(r.id)?'Fjern':'Gem'} ${esc(r.name)} ${saved.has(r.id)?'fra':'i'} favoritter"><span aria-hidden="true">${saved.has(r.id)?'♥':'♡'}</span></button><img class="food-photo" src="${esc(foodPhoto(r.cuisineRaw || (r.category==='cafe'?'coffee_shop':r.cuisine)).url)}" alt="${esc(foodPhoto(r.cuisineRaw || (r.category==='cafe'?'coffee_shop':r.cuisine)).alt)}; ikke fra ${esc(r.name)}" loading="lazy" decoding="async" referrerpolicy="no-referrer"><span class="photo-caption">Illustrationsfoto — ikke fra restauranten</span></div><div class="card-body"><div class="card-meta"><span>${esc(r.cuisine)}</span><span class="example">Åben katalogprofil</span></div><h3>${esc(r.name)}</h3><p class="location">⌖ ${esc(r.area === "Adresse ikke oplyst" ? "Odense-området · Se placering på kort" : r.area)}</p><div class="criteria-summary">${criteria.filter(c=>selected.has(c.key)).map(c=>`<span class="criterion ${r[c.key]===true?'yes':r[c.key]===false?'no':'unknown'}">${r[c.key]===true?'✓':r[c.key]===false?'×':'?'} ${c.short}</span>`).join('') || '<span>Vælg kriterier for at se dit match</span>'}</div><button class="profile" data-id="${esc(r.id)}"><span>Se rapport · ${esc(evidenceSummary(r,selected))}</span><span aria-hidden="true">${arrow}</span></button></div></article>`}).join('') + (items.length > visibleLimit ? '<button class="primary load-more" id="load-more">Vis flere spisesteder</button>' : '') : '<div class="empty"><h3>Ingen steder matcher din søgning</h3><p>Prøv et andet køkken eller en anden søgning. Hvis du bruger fulde match, vises steder med ukendte oplysninger ikke.</p><button id="reset" class="primary">Nulstil søgning</button></div>';
}
document.querySelector('#query').addEventListener('input',()=>{visibleLimit=24;render()});
document.querySelector('#saved-only').addEventListener('change',()=>{visibleLimit=24;render()});
document.querySelector('#sort').addEventListener('change',render);
document.querySelector('.category-tabs').addEventListener('click',e=>{const button=e.target.closest('[data-category]');if(!button)return;category=button.dataset.category;visibleLimit=24;render()});
document.querySelector('#city').addEventListener('change',render);
document.querySelector('#strict').addEventListener('change',render);
document.querySelector('.preferences').addEventListener('change',e=>{e.target.checked?selected.add(e.target.value):selected.delete(e.target.value);render()});
const dialog = document.querySelector('#detail');
results.addEventListener('click',e=>{
  const favorite=e.target.closest('[data-favorite]');
  if(favorite) { const id=favorite.dataset.favorite; saved.has(id)?saved.delete(id):saved.add(id); try {localStorage.setItem('tayyibah.favorites',JSON.stringify([...saved]));} catch {document.querySelector('#saved-message').textContent='Gemt for denne session. Browseren tillader ikke permanent lagring.';} render();document.querySelector(`[data-favorite="${id}"]`)?.focus();return; }
  if(e.target.closest('#load-more')) { visibleLimit += 24; render(); return; }
  if(e.target.closest('#reset')) {document.querySelector('#query').value='';document.querySelector('#city').value='';document.querySelector('#strict').checked=false;document.querySelector('#saved-only').checked=false;document.querySelector('#sort').value='name';category='all';visibleLimit=24;selected.clear();selected.add('halal');selected.add('alcohol');document.querySelectorAll('.preferences input').forEach(input=>input.checked=selected.has(input.value));render();return;}
  const button=e.target.closest('[data-id]');if(!button)return;
  location.hash='restaurant='+encodeURIComponent(button.dataset.id);
});
function openReport(id) {
  const r=restaurants.find(item=>item.id===id);
  if(!r)return;
  const maps = mapLinks(r.coordinates);
  const website = safeWebsite(r.website);
  const menu = safeWebsite(r.menuUrl);
  const checklist = criteria.filter(c=>selected.has(c.key));
  document.querySelector('#detail-content').innerHTML=`<p class="eyebrow">GOOD-RAPPORT · ÅBEN KATALOGPROFIL</p><h2 id="dialog-title">${esc(r.name)}</h2><p>${esc(r.cuisine)} · ${esc(r.area === "Adresse ikke oplyst" ? "Odense-området · Se placering på kort" : r.area)} · ${esc(r.price)}</p><p>${esc(r.description)}</p><section class="report-intro"><h3>Profilens grundlag</h3><p>Denne profil er oprettet fra OpenStreetMap. Restaurantens deltagelse og samtykke er ikke registreret. Profilen er ikke en halal-certificering.</p><div class="report-sources"><span>Restaurantens svar: ikke indhentet</span><span>Brugerobservationer: ingen registreret</span><span>Dokumentation: ikke gennemgået</span></div></section><label class="report-link-label" for="report-link">Fast link til denne rapport · kan bruges i en QR-kode</label><div class="report-share"><input id="report-link" readonly value="${esc(reportURL(r.id))}"><button id="copy-report" class="primary" type="button">Kopiér link</button></div><p id="report-copy-status" role="status"></p><div class="profile-actions">${website?`<a class="primary" href="${esc(website)}" target="_blank" rel="noopener noreferrer">Besøg hjemmesiden ${arrow}</a>`:""}${menu?`<a class="primary" href="${esc(menu)}" target="_blank" rel="noopener noreferrer">Se menu ${arrow}</a>`:""}${maps?`<a class="primary" href="${esc(maps.directions)}" target="_blank" rel="noopener noreferrer">Find vej ${arrow}</a>`:""}</div>${r.phone?`<p>Telefon oplyst i kilden: ${esc(r.phone)}</p>`:""}${r.openingHours?`<details><summary>Åbningstider fra kilden</summary><p>${esc(r.openingHours)}</p><p>Oplysningerne er ikke kontrolleret. Bekræft med stedet før dit besøg.</p></details>`:""}<section class="checklist-box"><h3>Godt at spørge om</h3><p>En lille tjekliste, du kan bruge, når du kontakter stedet.</p><ul>${checklist.length?checklist.map(c=>`<li>${esc(c.label)} — hvad kan stedet oplyse?</li>`).join(''):'<li>Hvilke halal-oplysninger og dokumentation har stedet?</li>'}</ul><button class="primary" id="copy-checklist" type="button">Kopiér min tjekliste</button><p id="copy-status" role="status"></p></section>${safePhotoReference(r.photoReference) ? `<p><a class="photo-reference" href="${esc(safePhotoReference(r.photoReference))}" target="_blank" rel="noopener noreferrer">Se billedhenvisning på Wikimedia Commons ${arrow}</a><br>Henvisning fra OpenStreetMap. Fotoets kilde og brugsbetingelser fremgår på Wikimedia.</p>` : ""}${maps ? `<section class="restaurant-map"><h3>Find restauranten</h3><p>Kort over placeringen — ikke et foto af facaden.</p><div id="map-container"><button class="primary" id="show-map" data-map="${esc(maps.embed)}">Vis interaktivt kort</button><p class="map-consent">Kortet hentes fra OpenStreetMap, når du klikker.</p></div><div class="map-actions"><a href="${esc(maps.full)}" target="_blank" rel="noopener noreferrer">Åbn stort kort ${arrow}</a><a href="${esc(maps.directions)}" target="_blank" rel="noopener noreferrer">Få rutevejledning ${arrow}</a></div><p>Placeringen kommer fra OpenStreetMap og kan være upræcis. For bygninger vises objektets midtpunkt.</p></section>` : `<p>Kortplacering mangler. Brug kildelinket nedenfor for at undersøge stedet.</p>`}<h3 class="report-heading">Rapport · mad og rammer</h3><p>Alle fem kriterier vises særskilt. Der gives ingen samlet halal-karakter.</p><div class="detail-list">${criteria.map(c=>`<div><div><strong>${c.label}</strong><p>${c.explanation}</p><p class="evidence-detail">Grundlag: ikke undersøgt · Kilde: ingen registreret<br>Kontroldato: ikke registreret · Omfang: ikke afklaret</p></div><span class="status ${r[c.key]===true?'yes':r[c.key]===false?'no':'unknown'}">${statusLabel(r[c.key])}</span></div>`).join('')}</div><p class="detail-note">${safeSourceURL(r.source?.url) ? `<a href="${esc(safeSourceURL(r.source.url))}" target="_blank" rel="noopener noreferrer">Se stedet på OpenStreetMap ${arrow}</a>` : "Kildelink mangler"}<br>Importeret: ${esc(r.source?.importedAt ? new Date(r.source.importedAt).toLocaleDateString("da-DK", {timeZone:"Europe/Copenhagen"}) : "Ukendt dato")}. Importdatoen er ikke en verificeringsdato. Halal-status, åbning og øvrige forhold skal bekræftes med restauranten.</p>`;
  dialog.setAttribute('aria-labelledby','dialog-title');if(!dialog.open)dialog.showModal();
}
function reportURL(id) {
  const url=new URL(location.href);url.hash='restaurant='+encodeURIComponent(id);return url.href;
}
function openFromURL() {
  if(!location.hash.startsWith('#restaurant=')) {if(dialog.open)dialog.close();return;}
  let id;try {id=decodeURIComponent(location.hash.slice(12));}catch{return;}
  if(restaurants.some(r=>r.id===id))openReport(id);
}
window.addEventListener('hashchange',openFromURL);
dialog.addEventListener('close',()=>{if(location.hash.startsWith('#restaurant='))history.replaceState(null,'',location.pathname+location.search);});
openFromURL();
document.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
render();

if (loadError) { document.querySelector(".demo-notice").textContent = "Restaurantdata kunne ikke indlæses. Genindlæs siden, eller kontrollér at serveren kører fra projektmappen."; results.innerHTML = "<div class=\"empty\"><h3>Restaurantdata er ikke tilgængelige</h3><p>Prøv at genindlæse siden.</p></div>"; }

document.querySelector("#detail-content").addEventListener("click", async e => {
  if(e.target.closest('#copy-report')) {const input=document.querySelector('#report-link');try {await navigator.clipboard.writeText(input.value);document.querySelector('#report-copy-status').textContent='Linket er kopieret.';}catch {input.focus();input.select();document.querySelector('#report-copy-status').textContent='Kopiér det markerede link.';}return;}
  if(e.target.closest("#copy-checklist")) {const text=document.querySelector(".checklist-box ul").innerText;try {await navigator.clipboard.writeText(text);document.querySelector("#copy-status").textContent="Tjeklisten er kopieret.";} catch {document.querySelector("#copy-status").textContent="Kunne ikke kopiere automatisk. Markér og kopiér teksten ovenfor.";}return;}
  const button = e.target.closest("#show-map");
  if (!button) return;
  const frame = document.createElement("iframe");
  frame.src = button.dataset.map;
  frame.title = "Kort over restaurantens placering";
  frame.loading = "lazy";
  frame.referrerPolicy = "no-referrer";
  document.querySelector("#map-container").replaceChildren(frame);
});

results.addEventListener('error', e => {
  if (!e.target.matches('.food-photo')) return;
  const photo=e.target;photo.hidden=true;const fallback=document.createElement('div');fallback.className='photo-unavailable';fallback.textContent='Madfoto kunne ikke hentes';photo.after(fallback);
}, true);
