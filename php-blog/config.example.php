<?php
/**
 * UKÁZKOVÁ konfigurace – na serveru se vytvoří kopie "config.php" se skutečnými údaji.
 * config.php je v .gitignore, aby hesla nikdy neunikla do repozitáře.
 */
declare(strict_types=1);

// Alwaysdata: MariaDB host má tvar NAZEV_UCETU.mysql.db
const DB_HOST = 'jakubryba.mysql.db';
const DB_NAME = 'jakubryba_blog';
const DB_USER = 'jakubryba_blog';
const DB_PASS = 'ZMEN_ME';

const SITE_NAME = 'Můj PHP blog';
const SITE_URL  = 'https://jakubryba.alwaysdata.net';
