# LO Evaluatie-app — werkafspraken

Deze app is gebouwd door Sander Voorons, leerkracht LO. Hij is geen programmeur:
leg keuzes uit in gewone taal en gebruik geen jargon zonder het te duiden.

## Wat dit is

Eén enkel HTML-bestand, `Evaluatie-app.html` (~285 KB): vanilla JavaScript, geen
build-stap, geen framework, geen npm. Alles zit in dat ene bestand — CSS, JS en
markup. Het draait als PWA op een telefoon en wordt gehost op GitHub Pages.

| Bestand | Rol |
|---|---|
| `Evaluatie-app.html` | de hele app |
| `sw.js` | service worker, maakt offline werken mogelijk |
| `index.html` | stuurt door naar de app |
| `manifest.webmanifest`, `icon-*.png` | installeren op het beginscherm |
| `LEES MIJ - de app.md` | changelog per versie + uploadinstructies |

## Regels die je niet mag breken

**1. Geen leerlingnamen in de code.** Klaslijsten, het lessenrooster en de
schoolkalender staan sinds v67 NIET meer in het bestand. Ze komen binnen via
een schoolbestand dat de gebruiker inleest (`lo_school_v1` en
`lo_tv_klassen_v3` in localStorage). Het app-bestand gaat naar een publieke
GitHub-map, dus één naam erin is een datalek. `DEFAULT_KLASSEN` blijft leeg.

**2. Versienummers lopen samen.** `APP_VERSION` in de html en `CACHE` in
`sw.js` moeten altijd hetzelfde nummer dragen (`v68` ↔ `lo-eval-v68`). Bump ze
bij elke wijziging die de gebruiker uploadt, anders krijgt zijn telefoon de
oude versie uit de cache.

**3. Alle gegevens blijven op het toestel.** localStorage, geen server, geen
sync. Dat is een bewuste keuze in verband met leerlingengegevens. Stel geen
cloudopslag voor.

**4. Test voor je zegt dat het werkt.** In die volgorde:
   - haal de `<script>`-blokken uit de html en draai `node --check` erop —
     één ontbrekend aanhalingsteken sloopt de hele app en dat zie je niet;
   - controleer op dubbele `id=` in de markup na het verplaatsen van blokken;
   - draai de app in Playwright (Chromium), vul echte gegevens in en lees de
     uitkomst na. Niet enkel kijken of er geen fout verschijnt.

## Hoe de app in elkaar zit

- **Tabbladen:** Les (register + evaluatie), Klas, Lesfiches, Instellingen.
- **Rubrieken** (`RUBRIEKEN`) komen in drie soorten voor, en elke functie die
  scores aanraakt moet alle drie aankunnen:
  - criteria-rubrieken (`R.criteria`, score = som van de criteria);
  - `type:"meting"` (atletiek: techniek /10 + prestatie uit een tabel /10);
  - `type:"ronden"` (waterloop: tijden per ronde + inzet).
  Vergeet je er één, dan crasht de app pas bij die ene rubriek.
- **localStorage-sleutels** beginnen allemaal met `lo_`. De back-up neemt
  automatisch alles met dat voorvoegsel mee, op `lo_thema`, `lo_bu_snooze` en
  `lo_last_backup` na. Nieuwe sleutels hoef je dus nergens te registreren.
- **Export:** de kolom `Punt` staat direct naast de naam, op de schaal waarop
  gescoord is — niet herleid naar /10. Die kolom gaat in Smartschool Skore en
  Skore rekent zelf om. Breek dat niet.

## Waar je op moet letten

- Deze map wordt door OneDrive gesynchroniseerd. Dat heeft al eens een
  bewerkte versie teruggezet naar een oudere. Controleer na een wijziging het
  versienummer in het bestand tegen wat je verwacht.
- Wijzigingen in `RUBRIEKEN` raken bestaande opgeslagen evaluaties: die staan
  als JSON in localStorage met de oude criteria-sleutels erin.
- Werk het blok in `LEES MIJ - de app.md` bij wanneer je een versie aflevert,
  in gewone taal en met wat er voor de gebruiker verandert.

## Wat de gebruiker zelf doet

Uploaden naar GitHub. Nooit wachtwoorden of codes vragen of invullen.
