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
4. **Články pouze z administrace (2026-09-02)**:
   - odstraněny všechny statické stránky článků a jejich generátor
   - homepage načítá nejnovější publikované články z Alwaysdata API
   - `/more/` načítá celý seznam publikovaných článků z Alwaysdata API
   - pevné karty a odkazy na odstraněné články byly z HTML odstraněny

5. **Duplicitní nadpis na homepage (2026-02-09)**: nadpis „Nejčtenější návody" se na `index.html`
   zobrazoval 2× (nad newsletterem i nad články). Modrý sloupec nad newsletterem teď nese
   nadpis „Newsletter" – duplicita zmizela, červený sloupec nad články si „Nejčtenější návody"
   ponechává.

6. **Smazány statické články (2026-03-09)**: odstraněny složky všech 7 napevno napsaných článků,
   které zůstaly v projektu po migraci na DB (git-a-github-bez-stresu…, git-a-github-bezpecne…,
   html-a-css-pevne-zaklady…, jak-se-naucit-programovat…, javascript-od-zakladu…,
   javascript-v-praxi…, php-a-mysql-propojeni…). Na žádný z nich už neodkazuje žádný živý
   soubor (`index.html`, `more/`, `vercel.json`, `JS/*.js`). Veškeré články tak čtou web jen z
   Alwaysdata API. `CSS/post.css`, třídy `.image-*` v main.css i obrázky v
   `assets/pictures/articles/` zůstaly zachovány (používají se pro články z DB).

## 🔲 Zbývá / otevřené (dle priority)

1. **Detail článku**: obrázek hlavičky je napevno `image-programming-workspace` pro všechny
   články z DB → ideálně posílat z API/DB; datum `created_at` formát `YYYY-MM-DD HH:MM:SS`
   parsuje Safari nespolehlivě (nahradit mezeru za `T`)
2. **Vyhledávání** – zatím jen pevný seznam slov v `xmkcskl.js`, nevyhledává články
   (nápad: přidat `?q=` do api.php a hledat v DB)
3. **Obsah článků** – další články se vytvářejí pouze přes Alwaysdata administraci

## 💡 Menší věci
- Detail nemá sekci „Související články"
- Karty „Nejčtenější návody" v bočním panelu detailu článku jsou stále neklikací (not-ready)

