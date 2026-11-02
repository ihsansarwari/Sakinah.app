# GOOD · طيّبة

Dansk, responsiv prototype til at finde spisesteder ud fra personlige præferencer. Siden viser 426 importerede OpenStreetMap-poster fra Odense-området (restauranter, caféer og takeaway). Det er ikke en fuldstændig oversigt eller en liste over verificerede halal-restauranter. Adresser mangler i det aktuelle udtræk; åbning og drift er ikke kontrolleret.

## Online med GitHub Pages

På GitHub: Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: **main**, mappe **/(root)** → Save. Repositoryet skal have GitHub Pages til rådighed på den aktuelle plan. En Pages-side er normalt offentlig; den indeholder kun prototypens statiske filer og offentlige OSM-data. Ingen login- eller hemmelighedsoplysninger skal lægges i checkoutet.

Forventet adresse er `https://ihsansarwari.github.io/Sakinah.app/`, når GitHub har gennemført første deployment. GitHub viser den aktive adresse under Settings → Pages. Nye pushes til main udløser efterfølgende opdateringer automatisk; det kan tage nogle minutter, før en genindlæsning viser ændringen. Import af nye restaurantdata sker stadig separat; en genindlæsning henter det senest gemte katalog, ikke en ny Overpass-import.

Projektet bruger relative aktivstier og `.nojekyll`, så de statiske filer også virker under repositoryets undermappe. Der kræves hverken Node.js eller Python på den besøgendes computer.

## Madfotos

Restaurantkort bruger nu udvalgte, eksternt hostede Unsplash-madfotos efter køkkentype. De mærkes altid “Illustrationsfoto — ikke fra restauranten”. Ved ukendt eller ikke-understøttet køkken bruges et generelt grøntsagsfoto. Billederne dokumenterer hverken stedets faktiske menu eller halal-status. Se `src/food-photos.js` for billedadresser og `https://unsplash.com/license` for billedlicensen. Intet Google-abonnement eller API-nøgle bruges. Der er ingen lokal kopi; hvis billedtjenesten er utilgængelig, vises en neutral fejltilstand. Livehentning af billeder kunne ikke verificeres i cloudmiljøet, fordi `images.unsplash.com` er blokeret af miljøets netværkspolitik. Browserkontrollen bruger simulerede billedsvar.

## Lokal server

Kræver Node.js 22 eller nyere. Ingen eksterne pakker er nødvendige.

```sh
npm start
```

Serveren lytter på port 3000; brug `PORT` til at vælge en anden port. Kør `npm test` for filtrerings- og matchtestene.

## Funktioner

Udforsk køkkenkategorier, søg på navn og område, gem favoritter på denne enhed, og sortér efter navn eller oplysningsmængde. Profiler har kildebaserede kontaktlinks, kort og en kopierbar besøgstjekliste. Vælg kriterier for halal-kød, alkoholservering, baggrundsmusik, afskærmet siddeområde og bøn. Se kun fulde match eller alle resultater med individuelle statusser. Restaurantprofiler viser også ukendte forhold. Ukendte kriterier beskrives som afventende oplysninger frem for en negativ vurdering. Favoritter gemmes kun i browserens lokale lager og synkroniseres ikke mellem enheder.

Et match er ikke en religiøs afgørelse eller halal-certificering. Ukendt tæller ikke som opfyldt. Siden bruger lokale fallback-skrifttyper og kræver ingen eksterne skrifttjenester.

## Import af rigtige grundoplysninger

`npm run import:restaurants` henter et geografisk afgrænset udsnit af Odense fra OpenStreetMaps Overpass API til `data/restaurants.osm.json`. Området er et rektangel, ikke en administrativ bygrænse. Det kræver curl og netadgang til `overpass-api.de`. Importen kan også køres mod et eksisterende Overpass JSON-udtræk:

```sh
node scripts/import-restaurants.mjs --input /sti/til/udtraek.json
```

Websiden indlæser `data/restaurants.osm.json`. Importen opdaterer dette katalog. Bevar OSM-kilde, importdato, attribution og ODbL-licens. `diet:halal` bevares kun som en uverificeret kildepåstand; ingen kriterier markeres som opfyldte automatisk. Importdato er ikke en kontroldato. Mislykkede eller tomme udtræk erstatter ikke eksisterende data. Forskellige OSM-objekter kan stadig repræsentere samme restaurant og skal gennemgås før publicering. `src/data.js` indeholder fortsat isolerede testeksempler; de vises ikke i appen. Forsidens statiske fallback skal regenereres ved katalogændringer, hvis den også skal vise de nye poster uden JavaScript.

## Kontroller og koncept

Kør `node scripts/browser-smoke.mjs` for browserkontrol af den præcise Pages-undermappe, søgning, kategorier, lokale favoritter, sortering, profiler, kort, nulstilling og mobilbredder. Playwright installeres separat i `/tmp/sakinah-browser` (se scriptets vejledning); det er ikke en produktionsafhængighed. Eksterne billed- og kortsvar simuleres og dokumenterer ikke tjenesternes aktuelle tilgængelighed.

Kataloget har stadig 426 OSM-poster. Berigelsen bevarer rå køkkenværdier og kildens snapshotdato; kategorierne oversættes til dansk. Der findes 215 hjemmesidelinks, 7 menulinks, 156 telefonfelter og 200 åbningstidsfelter. 22 poster er markeret som mulige dubletter til manuel gennemgang, men ingen er fjernet automatisk. Disse oplysninger er ikke bekræftet med restauranterne.

Se [konceptforslaget](docs/concept.md) for prioritering af en Odense-pilot, dokumentation pr. kriterium og en plan for brugertest. Det er forslag, ikke observerede brugerresultater.

## Næste produkttrin

Restaurantprofilerne har koordinater, kortvisning efter klik og links til stort OpenStreetMap-kort og rutevejledning. Kortet er et geografisk kort, ikke et gadefoto. OSM-midtpunkter kan afvige fra indgangen. En enkelt Commons-billedhenvisning vises som et eksternt link. Google Street View-integrationen er fjernet.

Der er endnu ingen database, login eller administrationsside. Før offentlig lancering kræves kilde og kontroldato pr. kriterium, dokumentation af halal-forhold, proces til rettelser og verificering samt en særskilt beslutning om en eventuel samlet rating. Mobilversionen er en responsiv hjemmeside; der er endnu ingen native app.

## Tayyibah-rapport og faste profillinks

Restaurantprofiler har faste links med `#restaurant=<OSM-id>`. Linket åbner den konkrete rapport direkte, også efter genindlæsning, og kan kopieres fra profilen og bruges som mål i en QR-kode. QR-billeder og fysiske klistermærker genereres endnu ikke. Brug den offentlige, publicerede adresse til trykte QR-koder; et localhost-link virker kun lokalt.

Rapporten adskiller restaurantens deltagelse fra restaurantens svar, brugerobservationer og gennemgået dokumentation. De nuværende importerede profiler har ingen registreret deltagelse, indsendte svar, brugerobservationer eller dokumentationsgennemgang. Hvert kriterium viser derfor manglende grundlag, kilde, kontroldato og omfang. Der er endnu ingen indsendelse, moderation eller login; eksisterende katalogdata ændres ikke til verificerede oplysninger.

## Navneskift til Tayyibah

Brand, rapporter og pakkenavn bruger Tayyibah. Repositoryets eksisterende mappe og GitHub Pages-sti hedder stadig `Sakinah.app`, så publicerede links bevares. De ændres først ved en særskilt omdøbning af repository/hosting. Favoritter læses fra den tidligere lagernøgle, hvis den nye endnu ikke findes; fremtidige ændringer gemmes under `tayyibah.favorites`.

## GOOD · طيّبة

Det synlige brand er GOOD med arabisk طيّبة (Tayyibah) og den danske tekst “God mad. Godt at vide.” Rapporter hedder GOOD-rapporter. Pakke- og lagernøgler bruger fortsat `tayyibah` for kontinuitet; eksisterende GitHub Pages-sti er uændret.
