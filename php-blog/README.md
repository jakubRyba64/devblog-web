# PHP Blog – MVC-ish mini blog (PHP 8 + MariaDB)

Jednoduchý blog s admin rozhraním – projekt na naučení **PHP → MySQL → zabezpečení**.
Cílový hosting: **Alwaysdata** (`jakubryba.alwaysdata.net`).

## Struktura

| Soubor | Co dělá |
|---|---|
| `index.php` | veřejný výpis příspěvků (nejnovější first) |
| `post.php?id=` | detail jednoho článku (404, když neexistuje) |
| `login.php` / `logout.php` | přihlášení admina (session + CSRF) |
| `admin.php` | seznam všech příspěvků včetně konceptů |
| `admin-edit.php` | vizuální editor článku (perex, obrázky, kategorie, datum, koncept/publikace) |
| `admin-preview.php` | bezpečný náhled rozepsaného článku bez uložení do databáze |
| `admin-upload.php` | zabezpečený upload obrázků z editoru |
| `admin-delete.php` | mazání – jen přes POST + CSRF |
| `install.php` | JEDNORÁZOVÉ vytvoření admin účtu (pak se zamkne) |
| `db.php` | PDO připojení (prepared statements všude) |
| `helpers.php` | escapování, CSRF, slugify, require_login, perex |
| `schema.sql` | tabulky `users` a `posts` |
| `config.example.php` | šablona konfigurace → na serveru se z ní udělá `config.php` |
| `admin.css` / `admin-editor.js` | světlá responzivní administrace v designu DevBlogu |
| `style.css` | základní vzhled přihlášení a jednoduchých veřejných PHP stránek |

## Přechod ze staré administrace

Před nasazením nové administrace nad existující databází spusťte jednou soubor
`migration-2026-admin.sql`. Přidá perex, kategorii, hlavní obrázek, formát obsahu
a datum publikace. Existující články zachová a označí jejich starý obsah jako prostý text.

## Zabezpečení (co projekt učí)

- **SQL injection** → výhradně PDO prepared statements
- **XSS** → veškerý výstup přes `e()` (htmlspecialchars)
- **CSRF** → token v session, kontrola u každého POSTu (`hash_equals`)
- **Session fixation** → `session_regenerate_id(true)` po přihlášení
- **Hesla** → `password_hash()` / `password_verify()` (bcrypt)
- **Tajemství** → `config.php` je v `.gitignore`, do repozitáře jde jen `config.example.php`
- **Mazání** → jen POST (ne GET odkaz), potvrzení přes confirm

## Nasazení na Alwaysdata

1. Nahraj obsah `php-blog/` do `/home/jakubryba/www/` (přes SSH/SFTP)
2. Na serveru vytvoř `config.php` (kopie `config.example.php` se skutečnými údaji)
3. Importuj `schema.sql` do databáze (přes phpMyAdmin ve VistaPanelu/panelu Alwaysdata nebo `mysql < schema.sql`)
4. Otevři `https://jakubryba.alwaysdata.net/install.php` a vytvoř admin účet
5. **SMAŽ `install.php` z serveru**
6. Hotovo – piš příspěvky přes `admin.php` 🙂

## Pojmy k nastudování

- PDO vs. mysqli, proč prepared statements
- `htmlspecialchars` vs. `strip_tags` – rozdíl a kdy co
- CSRF – útok i obrana
- `password_hash` – proč nikdy neukládat hesla jako text
