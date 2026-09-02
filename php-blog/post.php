<?php
declare(strict_types=1);
require __DIR__ . '/db.php';
require __DIR__ . '/helpers.php';

$id   = (int)($_GET['id'] ?? 0);
$stmt = db()->prepare('SELECT * FROM posts WHERE id = ? AND published = 1');
$stmt->execute([$id]);
$post = $stmt->fetch();

if (!$post) {
    http_response_code(404);
    exit('Článek nenalezen.');
}
?>
<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($post['title']) ?> – <?= e(SITE_NAME) ?></title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="top">
  <h1><a href="index.php"><?= e(SITE_NAME) ?></a></h1>
  <nav><a href="index.php">← Všechny příspěvky</a></nav>
</header>
<main>
  <a class="back" href="index.php">← Zpět na výpis</a>
  <article class="full">
    <h2><?= e($post['title']) ?></h2>
    <time datetime="<?= e($post['created_at']) ?>"><?= e(date('j. n. Y H:i', strtotime($post['created_at']))) ?></time>
    <div class="content"><?= nl2br(e($post['content'])) ?></div>
  </article>
</main>
<footer><p>Běží na PHP + MariaDB · hosting Alwaysdata</p></footer>
</body>
</html>
