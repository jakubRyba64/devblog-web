# Průběh práce – co je hotové a co zbývá

> Aktualizuje se po každé větší změně. Poslední aktualizace: 2026-09-02

## ✅ Hotovo

1. **PHP blog na Alwaysdata** – admin (login/CSRF/CRUD článků), DB tabulky `users`+`posts`,
   veřejné JSON API `api.php`. Detaily v `php-blog/README.md`.
2. **Detail článku z DB** – `/clanek/?id=X` načítá titulek, datum, obsah z API
   (`JS/db-articles.js` → `loadDetail()`), včetně chybových stavů (404, chybné id…).
3. **Homepage (2026-09-02)**:
   - SMAZÁNA sekce „NEJNOVĚJŠÍ ČLÁNKY" z vršku stránky
   - první falešná karta vpravo nahoře („responzivní web") nahrazena reálným článkem
     z DB (`#dbLatestArticle`, vykresluje `loadLatestIntoHome()` přes `?limit=1`)
   - doplněna CSS třída `.image-web-development` (main.css)
   - vyčištěn `db-articles.css` (zůstaly jen styly detailu)
4. **Klikací karty (2026-09-02)**:
   - vzniklo 6 nových statických stránek článků (generátor `tools/generate-static-articles.js`
     ze šablony jak-se-naucit-programovat…): JavaScript od základů, Git a GitHub bez stresu,
     HTML a CSS základy, JavaScript v praxi, Git a GitHub verzování, PHP a MySQL
   - velký článek vlevo i obě malé karty na homepage jsou nyní odkazy (`<a>`)
   - všechny 4 karty na `more/` jsou nyní odkazy (`<a class="dvojka-nejslab">`)
   - CSS selektory jsou třídní, takže `<article>` → `<a>` nezměnil vzhled

## 🔲 Zbývá / otevřené (dle priority)

1. **Detail článku**: obrázek hlavičky je napevno `image-programming-workspace` pro všechny
   články z DB → ideálně posílat z API/DB; datum `created_at` formát `YYYY-MM-DD HH:MM:SS`
   parsuje Safari nespolehlivě (nahradit mezeru za `T`)
2. **Vyhledávání** – zatím jen pevný seznam slov v `xmkcskl.js`, nevyhledává články
   (nápad: přidat `?q=` do api.php a hledat v DB)
3. **Migrace statických článků do DB** – aby byl celý obsah v jednom systému
   (tabulka `posts` je připravená; karty pak přesměrovat na `/clanek/?id=`)

## 💡 Menší věci
- Duplicitní nadpis „Nejčtenější návody" 2× na homepage (nad newsletterem i články)
- Detail nemá sekci „Související články"
- Karty „Nejčtenější návody" v bočním panelu detailu článku jsou stále neklikací (not-ready)

