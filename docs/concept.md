# Sakinah: et sted at vælge, før man går ud

## Produktløftet

**Find et godt sted at spise, og se hvad der faktisk er oplyst om mad og rammer.**

Sakinah skal gøre valget lettere for muslimer med forskellige behov. En restaurantoversigt med tydelig dokumentation er første produkt; levering og betaling venter. Et indbydende udtryk kan inspireres af madplatforme, mens oplysningerne om halal-mad, alkohol, musik, afskærmning og bøn er den vigtigste forskel.

Den nuværende import er en bred oversigt over spisesteder i Odense-området. Den er **ikke** en liste over halal-restauranter: de importerede kriterier er ukendte. Importeret antal, dokumenteret status og brugerens præferencer skal holdes adskilt i både tekst og funktioner.

## Forbedringer i den nuværende statiske app

1. **Gør oversigten let at udforske.** Vis køkkenkategorier, søgning og favoritter, der gemmes på denne enhed. Start med alle spisesteder frem for et tomt filter. Kald det ikke “i nærheden”, før en reel afstand eller en placering er valgt.
2. **Fortæl sandheden om ukendte forhold.** “Afventer oplysninger” er bedre end “0 af 2 matcher”, når begge valgte kriterier er ukendte. En optælling bør vise opfyldt, ikke opfyldt og ukendt hver for sig. “Vis kun dokumenterede match” skal forklare en tom oversigt og tilbyde at vise de øvrige steder igen.
3. **Giv en grund til at komme tilbage.** Favoritter og delbare links til en bestemt restaurant skaber værdi uden login. Favoritter på denne enhed er ikke en konto og synkroniseres ikke på tværs af telefon og computer.
4. **Hjælp med den næste handling.** Profilen skal først vise navn, adresse hvis kendt, kilde, rute og de kriterier brugeren har valgt. En kopierbar besøgscheckliste kan hjælpe brugeren med at stille de rigtige spørgsmål direkte til restauranten; den sender intet automatisk.
5. **Vær præcis om fotos.** Illustrationsfotos mærkes tæt ved hvert billede, også på mobil. De er inspiration, ikke en angivelse af stedets menu eller halal-status. Restaurantens egne billeder erstatter dem, når brugsret og kilde er registreret.

Forslag til tekst: “Spis godt. Vælg med omtanke.” / “Udforsk spisesteder i Odense-området” / “Du vælger kriterierne. Vi viser det, der er kendt.”

## Dokumentation frem for en samlet halal-karakter

En samlet score kan skjule, at maden er dokumenteret, mens et andet forhold ikke er undersøgt. Ingen overordnet “halal-godkendt”-badge eller stjerner i den nuværende version.

Hvert kriterium bør senere have to uafhængige felter:

| Felt | Betydning |
| --- | --- |
| Svar | Ja, nej, delvist eller ukendt; spørgsmålet skal være konkret |
| Oplysningens grundlag | Ikke undersøgt, oplyst af restauranten eller dokumentation gennemgået |
| Omfang | Eksempelvis bestemte kødtyper, retter, leverandører eller filialer |
| Kilde og dato | Link eller dokumentreference, dato for kontrollen og hvem der registrerede den |

“Dokumentation gennemgået” betyder kun, at det beskrevne materiale er set; det er ikke en selvstændig religiøs certificering. Leverandørcertifikat skal ikke automatisk gælde alle retter eller andre filialer. Importdatoen fra OpenStreetMap er ikke en dato for kontrol af restaurantens forhold.

Musik kan variere over dagen, afskærmning kan kræve booking, og plads til bøn er ikke nødvendigvis et egentligt bederum. Retningslinjer og beskrivelser bør fastholde disse forskelle. Brugeren bestemmer selv, hvilke forhold der er afgørende.

## Første by: dybde før større geografisk dækning

Behold Odense som pilot, hvis det er den by, ejeren lettest kan undersøge. Vælg en lille gruppe relevante steder til manuel gennemgang før en bred lancering. Kontakt restauranterne med et fælles spørgeskema, kontrollér menu og dokumentation, og indhent tilladelse til deres billeder. Dette kræver særskilt udførelse og autorisation; ingen restauranter er kontaktet som del af dette notat.

Prioritér korrekte adresser, aktive steder og kildeoplysninger før flere importerede poster. Den brede katalogimport kan eksistere ved siden af de gennemgåede profiler, men status skal være synlig og kunne filtreres. Et kort, troværdigt katalog er mere nyttigt end en landsdækkende påstand uden dokumentation.

## Hvad skal afprøves med brugere?

Først en lille, samtykkebaseret brugertest, eksempelvis med 5–8 personer. Tallene her er forsøgsdesign, ikke observerede resultater eller dokumentation for efterspørgsel.

- Kan personen finde et relevant sted og kilden til en oplysning uden hjælp?
- Forstår personen, at “ukendt” og illustrationsfoto ikke dokumenterer halal eller stedets faktiske menu?
- Hvilket kriterium ændrer restaurantvalget, og hvilke oplysninger mangler?
- Gemmer personen et sted eller vælger en rute, og bruger personen siden igen i de følgende uger?

Mål de konkrete handlinger frem for kun sidevisninger. Start eventuelt med interviews og frivillig tilbagemelding; der behøves ikke sporingssoftware i den første test. Bed restauranter om frivilligt at oplyse, om Sakinah skaber relevante henvendelser, før betaling for profiler overvejes. Fastlæg måltal efter en baseline frem for at opfinde vækstprognoser.

## En realistisk rækkefølge

| Nu | Når grunddata og brugerbehov er bekræftet | Senere ved faktisk efterspørgsel |
| --- | --- | --- |
| Kategorier, favoritter, tydelig status, gode profiler, kilde og rute | Administration, rettelser, dokumentationshistorik, restaurantens egen profiladgang | Bordbooking, bestilling til afhentning, eventuelt mobilapp |

Ingen betalingsflow, levering, offentlige brugerbedømmelser eller beskedtjeneste er nødvendige for at validere kerneidéen. En native app er først relevant, når den giver en konkret fordel over den responsive hjemmeside.

## Indtjening uden at sælge troværdigheden

Gratis grundprofiler kan give dækning. Senere kan restauranter betale for praktiske værktøjer, eksempelvis at vedligeholde menuer og modtage bookinghenvendelser, eller for tydeligt mærket sponsorering. Betaling må ikke købe halal-status, skjule negative svar eller placere en restaurant blandt dokumenterede match uden dokumentation.

Affiliate- og bookingindtægter kræver relevante aftaler og mærkning. Udskyd disse spor, indtil brugerne oplever værdi og de faktiske driftsomkostninger er kendt. Vurder også kilde- og billedlicenser, databeskyttelse samt en proces til rettelser, før produktet udvides.

## Afgrænsning af dette notat

Dette er produktforslag ud fra prototypen og de kendte databegrænsninger. Det er ikke markedsanalyse, en garanti for succes, en religiøs vurdering eller dokumentation for nogen restaurants egenskaber. Implementerede ændringer og faktisk verificerede data skal fremgå af kode, test og kilderegister hver for sig.
