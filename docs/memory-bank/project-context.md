# Kontext projektu DevBlog

> Tento soubor udržuje kontext projektu, ať AI (nebo nový vývojář) rozumí
> stavbě webu i bez znalosti předchozích konverzací. Poslední aktualizace: 2026-09-02

## Co projekt je

Osobní blog **DevBlog** – výukové články o programování (HTML, CSS, JavaScript, PHP, Git…).
Česky, čistý HTML/CSS/JS bez frameworků, nasazený na **Vercelu**
(`blog-v1-theta.vercel.app`, repo `jakubRyba64/responsive-blog-app`).

## Architektura (2 části)

### 1. Statický frontend (tento repozitář)
- `index.html` – homepage: články se načítají výhradně z Alwaysdata API, doplněné newsletterem
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
- **Vizuál karet z DB navazuje na původní karty** – stejné třídy (`one-article`,
  `img2 image-*`, `main-tittle2mini`, `notmain-tittle2`)
- **Obrázky článků** mají CSS třídy `.image-*` v main.css → `assets/pictures/articles/`
- Všechny karty na homepage i `/more/` vznikají z publikovaných záznamů v API
- Web má meta `noindex, nofollow` (zatím soukromý/projekt do školy)

## Zdroj článků

Statické články a jejich generátor byly odstraněny. Jediným zdrojem veřejných článků je nyní
tabulka `posts` spravovaná přes administraci na Alwaysdata.
