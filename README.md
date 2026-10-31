# Sakinah

Dansk, responsiv prototype til at finde spisesteder ud fra personlige præferencer. Siden viser 426 importerede OpenStreetMap-poster fra Odense-området (restauranter, caféer og takeaway). Det er ikke en fuldstændig oversigt eller en liste over verificerede halal-restauranter. Adresser mangler i det aktuelle udtræk; åbning og drift er ikke kontrolleret.

## Online med GitHub Pages

På GitHub: Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: **main**, mappe **/(root)** → Save. Repositoryet skal have GitHub Pages til rådighed på den aktuelle plan. En Pages-side er normalt offentlig; den indeholder kun prototypens statiske filer og offentlige OSM-data. Ingen login- eller hemmelighedsoplysninger skal lægges i checkoutet.

Forventet adresse er `https://ihsansarwari.github.io/Sakinah.app/`, når GitHub har gennemført første deployment. GitHub viser den aktive adresse under Settings → Pages. Nye pushes til main udløser efterfølgende opdateringer automatisk; det kan tage nogle minutter, før en genindlæsning viser ændringen. Import af nye restaurantdata sker stadig separat; en genindlæsning henter det senest gemte katalog, ikke en ny Overpass-import.

Projektet bruger relative aktivstier og `.nojekyll`, så de statiske filer også virker under repositoryets undermappe. Der kræves hverken Node.js eller Python på den besøgendes computer.

## Lokal start

## Aktivér Google Street View-fotos

Integrationen er klar, men ingen Google-billeder hentes, før en browsernøgle er konfigureret. Opret et Google Cloud-projekt, aktivér fakturering og **Street View Static API**, og opret en dedikeret API-nøgle. Begræns nøglen med **Websites / HTTP referrers** til `https://ihsansarwari.github.io/*` og med **API restrictions** til **Street View Static API**. Denne nøgle bliver synlig i browseren; brug aldrig en ubegrænset nøgle eller en servernøgle. Konfigurér kvoter og budgetbeskeder i Google Cloud (budgetbeskeder stopper ikke automatisk forbrug).

På GitHub kan `src/site-config.js` redigeres med blyanten: indsæt den begrænsede browsernøgle mellem de tomme anførselstegn i `googleStreetViewKey`, og commit ændringen til main. Del ikke nøglen i chatten. Pages opdaterer derefter automatisk siden. Nøglen må kun aktiveres, hvis Googles gældende vilkår passer til brugen.

Fotos hentes direkte fra Google uden lokal kopiering. Hele billedet og Googles attribution bevares; kortene bruger lazy loading. Når Google-nøglen er aktiv, erstattes det indlejrede OSM-kort på profilerne med et Google Maps-link. Billedet er et gadefoto nær koordinaterne, ikke en verificeret facade. Manglende dækning, kvote- eller nøglefejl viser en neutral fejltilstand. Fotos er endnu ikke livevalideret med en rigtig Google-nøgle.

## Lokal server

Kræver Node.js 22 eller nyere. Ingen eksterne pakker er nødvendige.

```sh
npm start
```

Serveren lytter på port 3000; brug `PORT` til at vælge en anden port. Kør `npm test` for filtrerings- og matchtestene.

## Funktioner

Søg på navn, køkken og område; filtrér på by; vælg kriterier for halal-kød, alkoholservering, baggrundsmusik, afskærmet siddeområde og bøn. Se kun fulde match eller alle resultater med individuelle statusser. Restaurantprofiler viser også ukendte forhold.

Et match er ikke en religiøs afgørelse eller halal-certificering. Ukendt tæller ikke som opfyldt. Siden bruger lokale fallback-skrifttyper og kræver ingen eksterne skrifttjenester.

## Import af rigtige grundoplysninger

`npm run import:restaurants` henter et geografisk afgrænset udsnit af Odense fra OpenStreetMaps Overpass API til `data/restaurants.osm.json`. Området er et rektangel, ikke en administrativ bygrænse. Det kræver curl og netadgang til `overpass-api.de`. Importen kan også køres mod et eksisterende Overpass JSON-udtræk:

```sh
node scripts/import-restaurants.mjs --input /sti/til/udtraek.json
```

Websiden indlæser `data/restaurants.osm.json`. Importen opdaterer dette katalog. Bevar OSM-kilde, importdato, attribution og ODbL-licens. `diet:halal` bevares kun som en uverificeret kildepåstand; ingen kriterier markeres som opfyldte automatisk. Importdato er ikke en kontroldato. Mislykkede eller tomme udtræk erstatter ikke eksisterende data. Forskellige OSM-objekter kan stadig repræsentere samme restaurant og skal gennemgås før publicering. `src/data.js` indeholder fortsat isolerede testeksempler; de vises ikke i appen. Forsidens statiske fallback skal regenereres ved katalogændringer, hvis den også skal vise de nye poster uden JavaScript.

## Næste produkttrin

Restaurantprofilerne har nu koordinater, kortvisning efter klik og links til stort OpenStreetMap-kort og rutevejledning. Kortet er et geografisk kort, ikke et gadefoto. OSM-midtpunkter kan afvige fra indgangen. En enkelt Commons-billedhenvisning findes i det aktuelle udtræk; den vises som et eksternt link, ikke et indlejret foto uden afklaret attribution/licens. De øvrige kortbilleder er fortsat tydeligt markerede illustrationer. Browserkontrollen tester kortknappen med et simuleret eksternt iframe-svar; den bekræfter ikke korttjenestens tilgængelighed i brugerens browser.

Der er endnu ingen database, login eller administrationsside. Før offentlig lancering kræves kilde og kontroldato pr. kriterium, dokumentation af halal-forhold, proces til rettelser og verificering samt en særskilt beslutning om en eventuel samlet rating. Mobilversionen er en responsiv hjemmeside; der er endnu ingen native app.
