<?php
/**
 * Veřejné JSON API – články z databáze pro oficiální DevBlog (statický web).
 *
 * Použití:
 *   GET api.php           → posledních 10 publikovaných článků (titulek + perex)
 *   GET api.php?limit=6   → počet článků (1–50)
 *   GET api.php?id=2      → jeden konkrétní článek (včetně celého obsahu)
 *
 * Koncepty (published = 0) se NIKDY nevypouštějí ven.
 */
declare(strict_types=1);

require __DIR__ . '/db.php';
require __DIR__ . '/helpers.php';

// CORS – statický web běží na jiné doméně (Vercel) a musí mít povolené čtení.
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Vary: Origin');
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Preflight požadavek prohlížeče
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

try {
    // ---------- Jeden článek ----------
    if (isset($_GET['id'])) {
        $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
        if ($id === false || $id < 1) {
            json_out(['error' => 'Neplatné ID článku.'], 422);
        }

        $stmt = db()->prepare(
            'SELECT id, title, content, created_at FROM posts WHERE id = ? AND published = 1 LIMIT 1'
        );
        $stmt->execute([$id]);
        $post = $stmt->fetch();

        if (!$post) {
            json_out(['error' => 'Článek nenalezen.'], 404);
        }

        json_out(['post' => [
            'id'         => (int) $post['id'],
            'title'      => (string) $post['title'],
            'excerpt'    => excerpt((string) $post['content'], 300),
            'content'    => (string) $post['content'],
            'created_at' => (string) $post['created_at'],
        ]]);
    }

    // ---------- Výpis nejnovějších ----------
    $limit = filter_var($_GET['limit'] ?? 10, FILTER_VALIDATE_INT, [
        'options' => ['default' => 10, 'min_range' => 1, 'max_range' => 50],
    ]);

    // LIMIT je po validaci čisté int => bezpečné vložit přímo do SQL.
    $stmt = db()->prepare(
        'SELECT id, title, content, created_at FROM posts WHERE published = 1 '
        . 'ORDER BY created_at DESC, id DESC LIMIT ' . $limit
    );
    $stmt->execute();
    $rows = $stmt->fetchAll();

    $posts = array_map(static function (array $r): array {
        return [
            'id'         => (int) $r['id'],
            'title'      => (string) $r['title'],
            'excerpt'    => excerpt((string) $r['content'], 300),
            'created_at' => (string) $r['created_at'],
        ];
    }, $rows);

    json_out(['count' => count($posts), 'posts' => $posts]);
} catch (Throwable $e) {
    json_out(['error' => 'Chyba serveru – zkuste to prosím později.'], 500);
}
