<?php
/**
 * Pomocné funkce: escapování (XSS), CSRF token, slug, login, perex.
 */
declare(strict_types=1);

/** HTML escapování – použít na VŠECHEN výstup z databáze. */
function e(?string $s): string
{
    return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
}

function csrf_token(): string
{
    if (session_status() !== PHP_SESSION_ACTIVE) session_start();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '">';
}

/** Ověření CSRF tokenu u každého POST požadavku. */
function csrf_check(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) session_start();
    if (!hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'] ?? '')) {
        http_response_code(403);
        exit('Neplatný CSRF token.');
    }
}

/** Převod titulku na URL-friendly slug včetně české diakritiky. */
function slugify(string $s): string
{
    $t = @iconv('UTF-8', 'ASCII//TRANSLIT', $s) ?: '';
    $t = strtolower($t);
    $t = preg_replace('~[^a-z0-9]+~', '-', $t) ?? '';
    $t = trim($t, '-');
    return $t !== '' ? $t : 'clanek';
}

/** Chráněná stránka – bez přihlášení přesměruje na login. */
function require_login(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) session_start();
    if (empty($_SESSION['user_id'])) {
        header('Location: login.php');
        exit;
    }
}

/** Perex: čistý text bez HTML, oříznutý na $len znaků. */
function excerpt(string $text, int $len = 300): string
{
    $text = trim(strip_tags($text));
    return mb_strlen($text) > $len ? mb_substr($text, 0, $len) . '…' : $text;
}
