<?php
declare(strict_types=1);
require __DIR__ . '/db.php';
require __DIR__ . '/helpers.php';

$posts = db()->query(
    'SELECT id, title, slug, content, created_at
     FROM posts
     WHERE published = 1
     ORDER BY created_at DESC'
)->fetchAll();
?>
<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e(SITE_NAME) ?></title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="top">
  <h1><a href="index.php"><?= e(SITE_NAME) ?></a></h1>
  <nav><a href="admin.php">Administrace</a></nav>
</header>
<main>
<?php if (!$posts): ?>
  <p class="empty">Zatím tu není žádný příspěvek. <a href="login.php">Přihlas se</a> a napiš první. ✍️</p>
<?php endif; ?>
<?php foreach ($posts as $p): ?>
  <article class="card">
    <h2><a href="post.php?id=<?= (int)$p['id'] ?>"><?= e($p['title']) ?></a></h2>
    <time datetime="<?= e($p['created_at']) ?>"><?= e(date('j. n. Y', strtotime($p['created_at']))) ?></time>
    <p><?= e(excerpt($p['content'])) ?></p>
    <a class="more" href="post.php?id=<?= (int)$p['id'] ?>">Číst dál →</a>
  </article>
<?php endforeach; ?>
</main>
<footer><p>Běží na PHP + MariaDB · hosting Alwaysdata</p></footer>
</body>
</html>
