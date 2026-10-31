import {googleStreetViewKey} from './site-config.js';
import {streetViewURL} from './street-view.js';
import {criteria, match, filterRestaurants} from './data.js';
import {escapeHTML as esc, safeSourceURL, mapLinks, safePhotoReference} from './catalog.js';
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
const app = document.querySelector('#app');
app.innerHTML = `
<header><a class="brand" href="./" aria-label="Sakinah forsiden"><span class="brand-mark">س</span>sakinah<span class="brand-dot">.</span></a><nav aria-label="Hovednavigation"><a href="#explore">Find spisesteder</a><a href="#principles">Sådan vurderer vi</a></nav><span class="demo-badge">Odense · Tidlig version</span></header>
<main><section class="hero"><div class="hero-copy"><p class="eyebrow"><span></span> GODE MÅLTIDER. GODE RAMMER.</p><h1>Spis med<br><em>ro i sindet.</em></h1><p class="intro">Find spisesteder, der passer til dine værdier.<br>Fra det på tallerkenen til stemningen omkring dig.</p><a class="primary" href="#explore">Find dit næste spisested <span>↗</span></a><div class="hero-note"><span>✧</span> Dine præferencer. Dit valg.</div></div><div class="hero-art" aria-hidden="true"><div class="arch"><div class="sun"></div><div class="stem stem-one"></div><div class="stem stem-two"></div><div class="plate"><div class="food food-one"></div><div class="food food-two"></div><div class="food food-three"></div><div class="herb">✳</div></div><div class="napkin"></div><div class="glass"></div></div><div class="art-label"><span>✧</span><div>Plads til det, der betyder noget<small>Mad · Omgivelser · Tryghed</small></div></div><span class="art-caption">ET MÅLTID ER MERE END MADEN</span></div></section>
<section class="values-strip" aria-label="Vores tilgang"><span>◎ Gennemsigtige kriterier</span><span>✧ Tilpasset dine værdier</span><span>↗ Plads til forskellige behov</span></section>
<section id="explore" class="explore"><div class="section-heading"><div><p class="eyebrow">FIND DIT STED</p><h2>Hvad betyder noget for dig?</h2></div><p>Vælg dine kriterier.<br>Vi hjælper dig med overblikket.</p></div>
<div class="search-bar"><label><span class="sr-only">Søg efter navn, køkken eller område</span><span aria-hidden="true">⌕</span><input id="query" type="search" placeholder="Søg efter navn, køkken eller område…"></label><label class="city-label"><span aria-hidden="true">⌖</span><span class="sr-only">By</span><select id="city"><option value="">Odense-området</option>${[...new Set(restaurants.map(r=>r.city))].filter(c=>c!=="By ikke oplyst").map(c=>`<option>${esc(c)}</option>`).join('')}</select></label></div>
<fieldset class="preferences"><legend>Dine præferencer</legend>${criteria.map(c=>`<label class="chip"><input type="checkbox" value="${c.key}" ${selected.has(c.key)?'checked':''}><span>${c.label}</span></label>`).join('')}</fieldset>
<div class="results-toolbar"><p id="count" role="status"></p><label class="strict"><input id="strict" type="checkbox"> Vis kun fulde match</label></div><div class="demo-notice"><span>ⓘ</span> Rigtige spisesteder fra OpenStreetMap i Odense-området. Adresser mangler i det aktuelle udtræk. Halal-status og øvrige kriterier er ikke verificeret. Oversigten er ikke en liste over godkendte halal-restauranter.</div><div id="results" class="grid"></div></section>
<section id="principles" class="principles"><p class="eyebrow">VIDEN FØR VURDERING</p><h2>Et overblik. Ikke en religiøs afgørelse.</h2><p>En god oplevelse ser forskellig ud fra person til person. Derfor viser vi hvert kriterium separat. Dit match viser kun, hvor mange af dine valgte kriterier stedet opfylder — det er ikke en halal-certificering.</p><div class="principle-grid"><article><span>01</span><h3>Du vælger det vigtige</h3><p>Mad, alkohol, musik, afskærmning og mulighed for bøn. Vælg ud fra dine egne behov.</p></article><article><span>02</span><h3>Ukendt betyder ukendt</h3><p>Manglende oplysninger tæller aldrig som et ja. Fremtidige vurderinger skal vise kilde og kontroldato.</p></article><article><span>03</span><h3>Bekræft før dit besøg</h3><p>Forhold kan ændre sig. Spørg altid restauranten om det, der er afgørende for dig.</p></article></div></section></main><footer><a class="brand" href="./">sakinah.</a><p>Gode steder. Med omtanke.</p><span><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a> · <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noopener noreferrer">ODbL</a></span></footer><dialog id="detail"><button class="close" aria-label="Luk restaurantprofil">×</button><div id="detail-content"></div></dialog>`;
let visibleLimit = 24;
const results = document.querySelector('#results');
const statusLabel = value => value===true?'Ja':value===false?'Nej':'Ukendt';
function render() {
  const items = filterRestaurants(restaurants,{query:document.querySelector('#query').value,city:document.querySelector('#city').value,selected,strict:document.querySelector('#strict').checked});
  document.querySelector('#count').textContent=`${items.length} spisesteder · ${selected.size} valgte kriterier`;
  results.innerHTML = items.length ? items.slice(0,visibleLimit).map(r=>{const m=match(r,selected);return `<article class="restaurant"><div class="card-photo">${streetViewURL(r.coordinates,googleStreetViewKey) ? `<img class="street-view-photo" src="${esc(streetViewURL(r.coordinates,googleStreetViewKey))}" alt="Street View-gadefoto nær ${esc(r.name)}; facaden er ikke verificeret" loading="lazy" decoding="async" referrerpolicy="strict-origin-when-cross-origin"><span class="photo-caption">Street View · Nær stedet</span>` : '<div class="photo-unavailable"><span aria-hidden="true">⌖</span><p>Foto af stedet mangler</p></div>'}</div><div class="card-body"><div class="card-meta"><span>${esc(r.cuisine)} · ${esc(r.price)}</span><span class="example">Ikke verificeret</span></div><h3>${esc(r.name)}</h3><p class="location">⌖ ${esc(r.area)} · ${esc(r.city === "By ikke oplyst" ? "Odense-området" : r.city)}</p><div class="criteria-summary">${criteria.filter(c=>selected.has(c.key)).map(c=>`<span class="criterion ${r[c.key]===true?'yes':r[c.key]===false?'no':'unknown'}">${r[c.key]===true?'✓':r[c.key]===false?'×':'?'} ${c.short}</span>`).join('') || '<span>Vælg kriterier for at se dit match</span>'}</div><button class="profile" data-id="${esc(r.id)}"><span>${m.total?`${m.matched} af ${m.total} matcher dine ønsker`:'Se alle oplysninger'}</span><span aria-hidden="true">↗</span></button></div></article>`}).join('') + (items.length > visibleLimit ? '<button class="primary load-more" id="load-more">Vis flere spisesteder</button>' : '') : '<div class="empty"><h3>Ingen steder matcher din søgning</h3><p>Prøv en anden by, færre kriterier eller slå “Vis kun fulde match” fra.</p><button id="reset" class="primary">Nulstil søgning</button></div>';
}
document.querySelector('#query').addEventListener('input',render);
document.querySelector('#city').addEventListener('change',render);
document.querySelector('#strict').addEventListener('change',render);
document.querySelector('.preferences').addEventListener('change',e=>{e.target.checked?selected.add(e.target.value):selected.delete(e.target.value);render()});
const dialog = document.querySelector('#detail');
results.addEventListener('click',e=>{
  if(e.target.closest('#load-more')) { visibleLimit += 24; render(); return; }
  if(e.target.closest('#reset')) {document.querySelector('#query').value='';document.querySelector('#city').value='';document.querySelector('#strict').checked=false;render();return;}
  const button=e.target.closest('[data-id]');if(!button)return;
  const r=restaurants.find(item=>item.id===button.dataset.id);
  const maps = mapLinks(r.coordinates);
  document.querySelector('#detail-content').innerHTML=`<p class="eyebrow">RESTAURANTPROFIL · IKKE VERIFICERET</p><h2 id="dialog-title">${esc(r.name)}</h2><p>${esc(r.cuisine)} · ${esc(r.area)} · ${esc(r.city === "By ikke oplyst" ? "Odense-området" : r.city)} · ${esc(r.price)}</p><p>${esc(r.description)}</p>${safePhotoReference(r.photoReference) ? `<p><a class="photo-reference" href="${esc(safePhotoReference(r.photoReference))}" target="_blank" rel="noopener noreferrer">Se billedhenvisning på Wikimedia Commons ↗</a><br>Henvisning fra OpenStreetMap. Fotoets kilde og brugsbetingelser fremgår på Wikimedia.</p>` : ""}${maps && !googleStreetViewKey ? `<section class="restaurant-map"><h3>Find restauranten</h3><p>Kort over placeringen — ikke et foto af facaden.</p><div id="map-container"><button class="primary" id="show-map" data-map="${esc(maps.embed)}">Vis interaktivt kort</button><p class="map-consent">Kortet hentes fra OpenStreetMap, når du klikker.</p></div><div class="map-actions"><a href="${esc(maps.full)}" target="_blank" rel="noopener noreferrer">Åbn stort kort ↗</a><a href="${esc(maps.directions)}" target="_blank" rel="noopener noreferrer">Få rutevejledning ↗</a></div><p>Placeringen kommer fra OpenStreetMap og kan være upræcis. For bygninger vises objektets midtpunkt.</p></section>` : (maps ? `<p><a href="${esc(maps.directions)}" target="_blank" rel="noopener noreferrer">Find stedet på Google Maps ↗</a><br>Street View viser gaden nær koordinaterne. Fotoet kan være gammelt og vise en anden facade.</p>` : `<p>Kortplacering mangler. Brug kildelinket nedenfor for at undersøge stedet.</p>`)}<div class="detail-list">${criteria.map(c=>`<div><div><strong>${c.label}</strong><p>${c.explanation}</p></div><span class="status ${r[c.key]===true?'yes':r[c.key]===false?'no':'unknown'}">${statusLabel(r[c.key])}</span></div>`).join('')}</div><p class="detail-note">${safeSourceURL(r.source?.url) ? `<a href="${esc(safeSourceURL(r.source.url))}" target="_blank" rel="noopener noreferrer">Se stedet på OpenStreetMap ↗</a>` : "Kildelink mangler"}<br>Importeret: ${esc(r.source?.importedAt ? new Date(r.source.importedAt).toLocaleDateString("da-DK", {timeZone:"Europe/Copenhagen"}) : "Ukendt dato")}. Importdatoen er ikke en verificeringsdato. Halal-status, åbning og øvrige forhold skal bekræftes med restauranten.</p>`;
  dialog.setAttribute('aria-labelledby','dialog-title');dialog.showModal();
});
document.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
render();

if (loadError) { document.querySelector(".demo-notice").textContent = "Restaurantdata kunne ikke indlæses. Genindlæs siden, eller kontrollér at serveren kører fra projektmappen."; results.innerHTML = "<div class=\"empty\"><h3>Restaurantdata er ikke tilgængelige</h3><p>Prøv at genindlæse siden.</p></div>"; }

document.querySelector("#detail-content").addEventListener("click", e => {
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
  if (!e.target.matches('.street-view-photo')) return;
  e.target.closest('.card-photo').innerHTML = '<div class="photo-unavailable"><span aria-hidden="true">⌖</span><p>Gadefoto kunne ikke hentes</p></div>';
}, true);
