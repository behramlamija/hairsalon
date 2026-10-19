# Frizerski studio Ilda — web stranica

Statična web stranica za **Frizerski studio Ilda** (Mostar, Kocine): svadbene i svečane frizure + live crtanje na vjenčanjima.
Rezervacija bez baze i bez prijave — forma složi poruku koju klijentica pošalje na **Viber** ili **SMS** (ili pozove).

- Čisti **HTML, CSS i JavaScript** (bez frameworka)
- **Node.js samo za build** (bez dodatnih paketa)

Autor: Lamija Behram

## Skripte

```bash
npm run dev       # http://localhost:5180 — služi src/
npm run build     # src/ → dist/ (minificiran CSS, hash u nazivima fajlova)
npm run preview   # služi dist/
```

`dist/` se može postaviti na bilo koji statični hosting (Netlify, Cloudflare Pages, GitHub Pages, običan cPanel).

## Struktura

```
src/
  index.html          sav sadržaj stranice
  css/style.css       stilovi (boje i fontovi su varijable na vrhu)
  js/main.js          meni, galerija, forma za rezervaciju, Viber/SMS linkovi
  images/             hero.jpg, crtanje.jpg, favicon.svg
  images/galerija/    fotografije galerije
build/
  build.mjs           build u dist/
  dev.mjs             lokalni server
```

## Fotografije

Dok prava fotografija ne postoji, umjesto nje se prikazuje nježni placeholder s opisom.
Dovoljno je ubaciti sliku s istim nazivom:

| Fajl | Gdje se prikazuje |
| --- | --- |
| `images/hero.jpg` | glavna fotografija na vrhu (uspravna, ~4:5) |
| `images/crtanje.jpg` | sekcija Live crtanje (uspravna, ~4:5) |
| `images/galerija/mladenka-1.jpg` … `crtez-2.jpg` | galerija (nazivi u `index.html`) |

Fotografije s Instagrama koristiti samo uz dozvolu vlasnice i osoba na slikama.

## Šta prilagoditi prije objave

- Cijene usluga i paketa crtanja (trenutno „na upit“)
- Listu usluga i radno vrijeme
- Broj telefona je na jednom mjestu u `js/main.js` (`STUDIO.phone`) i u `tel:` linkovima u `index.html`
