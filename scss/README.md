# SCSS styly

Všechny styly projektu se upravují ve složce `scss/`:

- `scss/site/` obsahuje styly veřejného webu a kompiluje se do `CSS/`.
- `scss/php-blog/` obsahuje styly PHP blogu a kompiluje se do `php-blog/`.

Prohlížeč načítá výsledné `.css` soubory, proto odkazy v HTML a PHP zůstávají beze změny.

## Příkazy

```powershell
npm install
npm run build:css
```

Při práci lze zapnout automatickou kompilaci po každém uložení:

```powershell
npm run watch:css
```

Soubory `.css` neupravujte ručně, protože je další kompilace přepíše.
