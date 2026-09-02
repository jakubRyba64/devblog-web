<?php
/** Pomocné funkce: escapování, CSRF, slug, přihlášení a bezpečný obsah. */
declare(strict_types=1);

function e(?string $s): string
{
    return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
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

function csrf_check(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) session_start();
    if (!hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'] ?? '')) {
        http_response_code(403);
        exit('Neplatný CSRF token.');
    }
}

function slugify(string $s): string
{
    $t = @iconv('UTF-8', 'ASCII//TRANSLIT', $s) ?: '';
    $t = strtolower($t);
    $t = preg_replace('~[^a-z0-9]+~', '-', $t) ?? '';
    $t = trim($t, '-');
    return $t !== '' ? $t : 'clanek';
}

function require_login(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) session_start();
    if (empty($_SESSION['user_id'])) {
        header('Location: login.php');
        exit;
    }
}

function excerpt(string $text, int $len = 300): string
{
    $text = html_entity_decode(strip_tags($text), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = trim(preg_replace('~\s+~u', ' ', $text) ?? $text);
    return mb_strlen($text) > $len ? rtrim(mb_substr($text, 0, $len)) . '…' : $text;
}

function frontend_url(): string
{
    return rtrim(defined('FRONTEND_URL') ? FRONTEND_URL : 'https://blog-v1-theta.vercel.app', '/');
}

function post_image_url(?string $path): ?string
{
    $path = trim((string)$path);
    if ($path === '') return null;
    if (preg_match('~^https://~i', $path)) return $path;
    if (preg_match('~^uploads/articles/[a-zA-Z0-9._-]+$~', $path)) {
        return rtrim(SITE_URL, '/') . '/' . $path;
    }
    return null;
}

function legacy_content_to_html(string $content): string
{
    $html = '';
    foreach (preg_split('~\R{2,}~u', trim($content)) ?: [] as $paragraph) {
        if (($paragraph = trim($paragraph)) !== '') {
            $html .= '<p>' . nl2br(e($paragraph), false) . '</p>';
        }
    }
    return $html;
}

function article_url_is_safe(string $url, bool $image = false): bool
{
    $url = trim(html_entity_decode($url, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    if ($url === '') return false;
    if (str_starts_with($url, '/')) return !str_starts_with($url, '//') && !str_contains($url, '\\');
    if (!$image && str_starts_with($url, '#')) return true;
    $scheme = strtolower((string)parse_url($url, PHP_URL_SCHEME));
    return in_array($scheme, $image ? ['http', 'https'] : ['http', 'https', 'mailto'], true);
}

/** Povolí jen HTML prvky potřebné pro článek; odstraní skripty a rizikové atributy. */
function sanitize_article_html(string $html): string
{
    $html = trim($html);
    if ($html === '') return '';
    if (!class_exists('DOMDocument')) return legacy_content_to_html(strip_tags($html));

    $allowed = array_fill_keys([
        'p', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'a', 'ul', 'ol', 'li',
        'blockquote', 'pre', 'code', 'br', 'img', 'figure', 'figcaption'
    ], true);
    $dangerous = ['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'form', 'input', 'button'];

    $dom = new DOMDocument('1.0', 'UTF-8');
    $previous = libxml_use_internal_errors(true);
    $dom->loadHTML('<?xml encoding="UTF-8"><div id="article-root">' . $html . '</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    libxml_clear_errors();
    libxml_use_internal_errors($previous);
    $root = $dom->getElementById('article-root');
    if (!$root) return '';

    $clean = function (DOMNode $node) use (&$clean, $allowed, $dangerous): void {
        if (!($node instanceof DOMElement) || $node->getAttribute('id') === 'article-root') {
            foreach (iterator_to_array($node->childNodes) as $child) $clean($child);
            return;
        }
        $tag = strtolower($node->tagName);
        if (in_array($tag, $dangerous, true)) {
            $node->parentNode?->removeChild($node);
            return;
        }
        foreach (iterator_to_array($node->childNodes) as $child) $clean($child);
        if (!isset($allowed[$tag])) {
            $parent = $node->parentNode;
            if (!$parent) return;
            while ($node->firstChild) $parent->insertBefore($node->firstChild, $node);
            $parent->removeChild($node);
            return;
        }

        $href = $tag === 'a' ? trim($node->getAttribute('href')) : '';
        $title = $tag === 'a' ? trim($node->getAttribute('title')) : '';
        $src = $tag === 'img' ? trim($node->getAttribute('src')) : '';
        $alt = $tag === 'img' ? trim($node->getAttribute('alt')) : '';
        foreach (iterator_to_array($node->attributes) as $attr) $node->removeAttribute($attr->name);
        if ($tag === 'a' && article_url_is_safe($href)) {
            $node->setAttribute('href', $href);
            if ($title !== '') $node->setAttribute('title', $title);
            if (preg_match('~^https?://~i', $href)) $node->setAttribute('rel', 'noopener noreferrer');
        }
        if ($tag === 'img' && article_url_is_safe($src, true)) {
            $node->setAttribute('src', $src);
            $node->setAttribute('alt', $alt);
            $node->setAttribute('loading', 'lazy');
        }
    };
    $clean($root);

    $result = '';
    foreach ($root->childNodes as $child) $result .= $dom->saveHTML($child);
    return trim($result);
}



/** Uloží ověřený JPEG/PNG/WebP a vrátí relativní cestu pro databázi. */
function store_article_upload(array $file): string
{
    $error = (int)($file['error'] ?? UPLOAD_ERR_NO_FILE);
    if ($error === UPLOAD_ERR_NO_FILE) return '';
    if ($error !== UPLOAD_ERR_OK) throw new RuntimeException('Obrázek se nepodařilo nahrát.');
    if ((int)($file['size'] ?? 0) > 5 * 1024 * 1024) {
        throw new RuntimeException('Obrázek může mít nejvýše 5 MB.');
    }

    $tmp = (string)($file['tmp_name'] ?? '');
    if ($tmp === '' || !is_uploaded_file($tmp)) throw new RuntimeException('Neplatný nahraný soubor.');
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($tmp);
    $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (!isset($extensions[$mime]) || @getimagesize($tmp) === false) {
        throw new RuntimeException('Povolené formáty jsou JPG, PNG a WebP.');
    }

    $directory = __DIR__ . '/uploads/articles';
    if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
        throw new RuntimeException('Složku pro obrázky se nepodařilo vytvořit.');
    }
    $filename = date('Ymd') . '-' . bin2hex(random_bytes(12)) . '.' . $extensions[$mime];
    if (!move_uploaded_file($tmp, $directory . '/' . $filename)) {
        throw new RuntimeException('Obrázek se nepodařilo uložit.');
    }
    return 'uploads/articles/' . $filename;
}

function article_categories(): array
{
    return ['Programování', 'HTML a CSS', 'JavaScript', 'PHP', 'Databáze', 'Git', 'Nástroje'];
}
