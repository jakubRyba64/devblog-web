<?php
declare(strict_types=1);
require __DIR__ . '/db.php';
require __DIR__ . '/helpers.php';
session_start();
require_login();

$id    = (int)($_GET['id'] ?? 0);
$post  = null;
if ($id) {
    $stmt = db()->prepare('SELECT * FROM posts WHERE id = ?');
    $stmt->execute([$id]);
    $post = $stmt->fetch();
    if (!$post) {
        http_response_code(404);
        exit('Příspěvek nenalezen.');
    }
}

$errors    = [];
$title     = $post['title']     ?? '';
$slug      = $post['slug']      ?? '';
$content   = $post['content']   ?? '';
$published = $post ? (bool)$post['published'] : true;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $title     = trim($_POST['title'] ?? '');
    $slug      = slugify(trim($_POST['slug'] ?? '') ?: $title);
    $content   = trim($_POST['content'] ?? '');
    $published = isset($_POST['published']);

    if ($title === '')                  $errors[] = 'Titulek nesmí být prázdný.';
    if (mb_strlen($title) > 255)        $errors[] = 'Titulek je příliš dlouhý (max. 255 znaků).';

    // zajištění unikátního slugu (kromě právě upravovaného článku)
    if (!$errors) {
        $base = $slug;
        $i = 1;
        while (true) {
            $stmt = db()->prepare('SELECT id FROM posts WHERE slug = ? AND id != ?');
            $stmt->execute([$slug, $id]);
            if (!$stmt->fetch()) break;
            $slug = $base . '-' . (++$i);
        }
    }

    if (!$errors) {
        if ($id) {
            $stmt = db()->prepare(
                'UPDATE posts SET title = ?, slug = ?, content = ?, published = ? WHERE id = ?'
            );
            $stmt->execute([$title, $slug, $content, (int)$published, $id]);
        } else {
            $stmt = db()->prepare(
                'INSERT INTO posts (title, slug, content, published, created_at, updated_at)
                 VALUES (?, ?, ?, ?, NOW(), NOW())'
            );
            $stmt->execute([$title, $slug, $content, (int)$published]);
            $id = (int)db()->lastInsertId();
        }
        header('Location: admin.php?saved=' . $id);
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= $id ? 'Úprava' : 'Nový' ?> příspěvek – <?= e(SITE_NAME) ?></title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="top">
  <h1><a href="index.php"><?= e(SITE_NAME) ?></a></h1>
  <nav><a href="admin.php">← Administrace</a></nav>
</header>
<main>
  <h2><?= $id ? 'Úprava příspěvku' : 'Nový příspěvek' ?></h2>

  <?php foreach ($errors as $err): ?><div class="alert"><?= e($err) ?></div><?php endforeach; ?>

  <form method="post" class="stack">
    <?= csrf_field() ?>
    <label>Titulek
      <input type="text" name="title" required value="<?= e($title) ?>">
    </label>
    <label>URL slug (nech prázdné = vygeneruje se z titulku)
      <input type="text" name="slug" value="<?= e($slug) ?>" placeholder="např. muj-prvni-clanek">
    </label>
    <label>Obsah (odstavce odděl prázdným řádkem)
      <textarea name="content" required><?= e($content) ?></textarea>
    </label>
    <label class="check">
      <input type="checkbox" name="published" <?= $published ? 'checked' : '' ?>>
      Zveřejnit (odškrtni = uložit jako koncept)
    </label>
    <div class="row">
      <button class="btn">Uložit</button>
      <a class="btn ghost" href="admin.php">Zrušit</a>
      <?php if ($id && $published): ?>
        <a class="muted" href="post.php?id=<?= $id ?>" target="_blank">Náhled ↗</a>
      <?php endif; ?>
    </div>
  </form>
</main>
</body>
</html>
