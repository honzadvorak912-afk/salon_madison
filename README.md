# Salón Madison – web

Redesign webu kadeřnického salónu Madison (Pardubice). Statický web (HTML/CSS/JS) s fotogalerií a administrací napojenou na **Supabase** – změny se projeví **ihned na všech zařízeních**.

## Soubory

| Soubor | Popis |
|---|---|
| `index.html` + `index.css` | Domů / O salónu |
| `sluzby.html` + `sluzby.css` | Služby |
| `galerie.html` + `galerie.css` | Fotogalerie (načítá se ze Supabase, realtime) |
| `kontakt.html` + `kontakt.css` | Kontakt + formulář (Formspree) + mapa |
| `admin.html` + `admin.css` + `admin.js` | Administrace (heslo, přidávání/mazání fotek, změna hesla) |
| `style.css` | Společný styl + mobilní menu (burger) |
| `main.js` | Burger menu, navigace |
| `supabase-gallery.js` | Připojení k Supabase + funkce galerie |
| `config.js` | Konfigurace (Supabase údaje) |
| `supabase-setup.sql` | SQL skript pro nastavení databáze |

## Nastavení Supabase (jednou)

1. Otevři svůj Supabase projekt (stejný jako Penzion na Krétě).
2. **SQL Editor → New query** → vlož obsah `supabase-setup.sql` → **Run**.
3. **Storage → New bucket** → název **`madison-gallery`** → zapni **Public bucket** → Save.
   - (Politiky pro storage už SQL skript nastavil.)

Konfigurace v `config.js` je už vyplněná (Project URL + publishable klíč). Fotky jsou v oddělených tabulkách `madison_*` a bucketu `madison-gallery`, takže se **nemíchají** s Penzionem.

## Administrace

- Otevři `admin.html` (odkaz „Administrace" je i v patičce každé stránky).
- **Výchozí heslo: `madison2026`** – po prvním přihlášení si ho hned změň v sekci „Změna hesla".
- Přidávání fotek: vyber nebo přetáhni soubory, volitelně přidej popisek.
- Mazání: klikni na ✕ u fotky.
- **Oznámení / poznámky:** v sekci „Poznámky / oznámení" můžeš přidávat krátká sdělení pro zákazníky (např. změna otevírací doby, dovolená). Zobrazí se na úvodní stránce a projeví se ihned na všech zařízeních.
- Heslo je uložené v Supabase (jako bezpečný hash), takže funguje na všech zařízeních.

## Kontaktní formulář

Formulář na stránce Kontakt odesílá přes **Formspree** (`https://formspree.io/f/mjgdlazz`). Zprávy ti chodí na e-mail nastavený ve Formspree účtu.

## Mobilní verze

Web je plně responzivní. Na telefonu/tabletu se navigace skryje do **burger menu** (ikona vpravo nahoře).

## Spuštění / nasazení

Stačí nahrát všechny soubory na hosting (např. GitHub Pages jako u Penzionu). Web je čistě statický – nepotřebuje server.
