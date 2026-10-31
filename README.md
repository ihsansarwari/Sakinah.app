# Sakinah

Dansk, responsiv prototype til at finde restauranter ud fra personlige præferencer. Alle restauranter og oplysninger er **fiktive eksempeldata**.

## Start

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

Importen er et forberedelsestrin: den ændrer ikke websidens demooversigt. Bevar OSM-kilde, importdato, attribution og ODbL-licens ved senere integration. `diet:halal` bevares kun som en uverificeret kildepåstand; ingen kriterier markeres som opfyldte automatisk. Importdato er ikke en kontroldato. Mislykkede eller tomme udtræk erstatter ikke eksisterende data. Forskellige OSM-objekter kan stadig repræsentere samme restaurant og skal gennemgås før publicering.

## Næste produkttrin

Der er endnu ingen database, rigtige restaurantdata, login eller administrationsside. Før offentlig lancering kræves en lovligt anvendelig datakilde, kilde og kontroldato pr. kriterium, dokumentation af halal-forhold, proces til rettelser og verificering samt en særskilt beslutning om en eventuel samlet rating. Mobilversionen er en responsiv hjemmeside; der er endnu ingen native app.
