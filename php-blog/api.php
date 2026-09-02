<?php
/**
 * Veřejné JSON API pro statický DevBlog.
 * GET ?limit=10, GET ?id=2 nebo GET ?slug=url-clanku.
 */
declare(strict_types=1);

require __DIR__ . '/db.php';
require __DIR__ . '/helpers.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Vary: Origin');
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}
function json_out(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function api_post(array $row, bool $detail = false): array
{
    $customExcerpt = trim((string)($row['excerpt'] ?? ''));
    $result = [
        'id'           => (int)$row['id'],
        'title'        => (string)$row['title'],
        'slug'         => (string)$row['slug'],
        'excerpt'      => $customExcerpt !== '' ? $customExcerpt : excerpt((string)$row['content'], 300),
        'intro'        => $customExcerpt,
        'category'     => (string)($row['category'] ?? 'Programování'),
        'image_url'    => post_image_url($row['featured_image'] ?? null),
        'published_at' => (string)($row['published_at'] ?: $row['created_at']),
        'created_at'   => (string)$row['created_at'],
        'updated_at'   => (string)$row['updated_at'],
    ];
    if ($detail) {
        $format = (string)($row['content_format'] ?? 'plain');
        $result['content_format'] = $format;
        $result['content'] = $format === 'html'
            ? sanitize_article_html((string)$row['content'])
            : (string)$row['content'];
    }
    return $result;
}

try {
    $fields = 'id, title, slug, excerpt, category, featured_image, content, content_format, '
        . 'published_at, created_at, updated_at';
    $publicWhere = 'published = 1 AND (published_at IS NULL OR published_at <= NOW())';

    if (isset($_GET['id']) || isset($_GET['slug'])) {
        if (isset($_GET['id'])) {
            $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
            if ($id === false || $id < 1) json_out(['error' => 'Neplatné ID článku.'], 422);
            $stmt = db()->prepare("SELECT $fields FROM posts WHERE id = ? AND $publicWhere LIMIT 1");
            $stmt->execute([$id]);
        } else {
            $slug = trim((string)$_GET['slug']);
            if (!preg_match('~^[a-z0-9][a-z0-9-]{0,254}$~', $slug)) {
                json_out(['error' => 'Neplatná URL adresa článku.'], 422);
            }
            $stmt = db()->prepare("SELECT $fields FROM posts WHERE slug = ? AND $publicWhere LIMIT 1");
            $stmt->execute([$slug]);
        }

        $post = $stmt->fetch();
        if (!$post) json_out(['error' => 'Článek nenalezen.'], 404);
        json_out(['post' => api_post($post, true)]);
    }

    $limit = filter_var($_GET['limit'] ?? 10, FILTER_VALIDATE_INT, [
        'options' => ['default' => 10, 'min_range' => 1, 'max_range' => 50],
    ]);
    $stmt = db()->prepare(
        "SELECT $fields FROM posts WHERE $publicWhere "
        . 'ORDER BY COALESCE(published_at, created_at) DESC, id DESC LIMIT ' . (int)$limit
    );
    $stmt->execute();
    $posts = array_map(static fn(array $row): array => api_post($row), $stmt->fetchAll());
    json_out(['count' => count($posts), 'posts' => $posts]);
} catch (Throwable $e) {
    json_out(['error' => 'Chyba serveru – zkuste to prosím později.'], 500);
}
