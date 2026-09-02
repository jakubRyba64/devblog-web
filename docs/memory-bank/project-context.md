# Kontext projektu DevBlog

> Tento soubor udržuje kontext projektu, ať AI (nebo nový vývojář) rozumí
> stavbě webu i bez znalosti předchozích konverzací. Poslední aktualizace: 2026-09-02

## Co projekt je

Osobní blog **DevBlog** – výukové články o programování (HTML, CSS, JavaScript, PHP, Git…).
Česky, čistý HTML/CSS/JS bez frameworků, nasazený na **Vercelu**
(`blog-v1-theta.vercel.app`, repo `jakubRyba64/responsive-blog-app`).

## Architektura (2 části)

### 1. Statický frontend (tento repozitář)
- `index.html` – homepage: velký článek vlevo + karty vpravo + newsletter + „Nejčtenější návody"
- `clanek/index.html` – univerzální detail článku z databáze (`/clanek/?id=X`)
- `more/`, `about/`, `kontakt/`, `privacy-policy/`, `404.html`
- `JS/db-articles.js` – načítá články z JSON API a vkládá je do designu webu
  (náhled na homepage: `#dbLatestArticle`, detail: `#dbArticleRoot`)
- `JS/xmkcskl.js` – menu, search panel, rok ve footeru (search zatím jen statické návrhy slov)
- `CSS/main.css` – hlavní design, `CSS/db-articles.css` – styly detailu z DB

### 2. PHP blog = headless CMS (složka `php-blog/`, hostováno na Alwaysdata)
- MariaDB na Alwaysdata, schéma v `schema.sql`: tabulky `users` + `posts`
  (posts: id, title, slug, content, published, created_at, updated_at)
- Admin: `login.php`, `admin.php`, `admin-edit.php`, `admin-delete.php` (session + CSRF)
- Veřejné JSON API `api.php`:
  - `GET api.php?limit=N` → nejnovější publikované články (title, excerpt…)
  - `GET api.php?id=X` → celý článek (404 pro koncepty/neexistující)
- Detaily nasazení: `php-blog/README.md`

## Důležitá rozhodnutí z minula

- **Články se negenerují staticky** – web je čte živě z API (koncepty se nikdy nevypouští ven)
- **XSS ochrana**: veškerá data z API se vkládají přes `textContent`/`createElement`, ne `innerHTML`
- **Vizuál karet z DB je identický s falešnými kartami** – stejné třídy (`one-article`,
  `img2 image-*`, `main-tittle2mini`, `notmain-tittle2`)
- **Obrázky článků** mají CSS třídy `.image-*` v main.css → `assets/pictures/articles/`
- Sekci „NEJNOVĚJŠÍ ČLÁNKY" z vršku homepage jsme smazali; nejnovější článek z DB
  teď sedí jako první malá karta vpravo nahoře
- Web má meta `noindex, nofollow` (zatím soukromý/projekt do školy)

## Známé „falešné" (statické) články – mají teď vlastní stránky, kandidáti na přesun do DB
- „Jak se naučit programovat: praktický plán pro začátečníky" (ručně psaná stránka,
  redirect z `/post.html` v vercel.json)
- „JavaScript od základů: proměnné, funkce a DOM" (homepage karta)
- „Git a GitHub bez stresu: první verzování projektu" (homepage karta)
- „HTML a CSS: pevné základy moderního webu" (more/)
- „JavaScript v praxi: interaktivní web krok za krokem" (more/)
- „Git a GitHub: bezpečné verzování projektů" (more/)
- „PHP a MySQL: propojení formuláře s databází" (more/)

Nové statické stránky článků se generují skriptem `tools/generate-static-articles.js`
(šablona = ručně psaná stránka jak-se-naucit-programovat…; spuštění: `node tools/generate-static-articles.js`).
