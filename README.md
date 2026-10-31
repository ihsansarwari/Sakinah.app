# Sakinah

Dansk, responsiv prototype til at finde spisesteder ud fra personlige præferencer. Siden viser 426 importerede OpenStreetMap-poster fra Odense-området (restauranter, caféer og takeaway). Det er ikke en fuldstændig oversigt eller en liste over verificerede halal-restauranter. Adresser mangler i det aktuelle udtræk; åbning og drift er ikke kontrolleret.

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

Websiden indlæser `data/restaurants.osm.json`. Importen opdaterer dette katalog. Bevar OSM-kilde, importdato, attribution og ODbL-licens. `diet:halal` bevares kun som en uverificeret kildepåstand; ingen kriterier markeres som opfyldte automatisk. Importdato er ikke en kontroldato. Mislykkede eller tomme udtræk erstatter ikke eksisterende data. Forskellige OSM-objekter kan stadig repræsentere samme restaurant og skal gennemgås før publicering. `src/data.js` indeholder fortsat isolerede testeksempler; de vises ikke i appen. Forsidens statiske fallback skal regenereres ved katalogændringer, hvis den også skal vise de nye poster uden JavaScript.

## Næste produkttrin

Der er endnu ingen database, login eller administrationsside. Før offentlig lancering kræves kilde og kontroldato pr. kriterium, dokumentation af halal-forhold, proces til rettelser og verificering samt en særskilt beslutning om en eventuel samlet rating. Mobilversionen er en responsiv hjemmeside; der er endnu ingen native app.
