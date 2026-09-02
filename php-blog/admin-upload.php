<?php
declare(strict_types=1);
require __DIR__ . '/db.php';
require __DIR__ . '/helpers.php';
session_start();
require_login();

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Použijte metodu POST.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    csrf_check();
    $path = store_article_upload($_FILES['image'] ?? []);
    if ($path === '') throw new RuntimeException('Vyberte obrázek.');
    echo json_encode(['url' => post_image_url($path), 'path' => $path], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
    http_response_code(422);
    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
