# Burger Empire

Ersteller: Dario

Technologien: HTML5, SCSS, generiertes CSS, Node.js Task Runner

## Workflow

- `style.scss` ist die Quelle fuer das Styling.
- `style.css` wird daraus generiert und von den HTML-Dateien geladen.
- Der Ordner `docs/` wird beim Build automatisch neu erzeugt.

## Wichtige Befehle

- `npm install` installiert die Abhaengigkeiten.
- `npm run build` kompiliert `style.scss` zu `style.css` und erstellt den minimierten `docs/`-Build.
- `npm run rebuild` setzt alles neu auf und fuehrt danach den Build aus.

## Projektstruktur

- Hauptverzeichnis: bearbeitbare Quelldateien
- `style.scss`: zentrale Style-Quelle
- `style.css`: generiertes CSS fuer den Browser
- `docs/`: minimierte Ausgabe fuer Deployment oder GitHub Pages

## Kurzer Check vor Abgabe

- Alle Navigation-Links funktionieren.
- Bilder und Videos laden korrekt.
- Kontakt- und Login-Formulare sehen sauber aus.
- `node_modules/` wird nicht ins Repo hochgeladen.
- `package.json` und `package-lock.json` sind vorhanden.
