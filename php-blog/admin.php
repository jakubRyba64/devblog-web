<?php
declare(strict_types=1);
require __DIR__ . '/db.php';
require __DIR__ . '/helpers.php';
session_start();
require_login();

$posts = db()->query('SELECT id, title, slug, category, published, published_at, created_at, updated_at FROM posts ORDER BY updated_at DESC, id DESC')->fetchAll();
?>
<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Příspěvky | DevBlog</title>
<link rel="stylesheet" href="admin.css">
</head>
<body class="admin-body">
<header class="admin-header">
  <a class="admin-brand" href="admin.php">Dev<span>Blog</span></a>
  <nav class="admin-nav" aria-label="Administrace"><a class="active" href="admin.php">Příspěvky</a><a href="admin-edit.php">Nový příspěvek</a></nav>
  <div class="admin-user"><span><?= e($_SESSION['username'] ?? '') ?></span><a href="logout.php">Odhlásit se</a></div>
</header>

<main class="posts-shell">
  <div class="posts-heading"><div><p class="eyebrow">Administrace</p><h1>Správa příspěvků</h1><p>Vytvářejte, upravujte a publikujte články na jednom místě.</p></div><a class="button primary" href="admin-edit.php">+ Nový příspěvek</a></div>
  <?php if (isset($_GET['saved'])): ?><div class="message success" role="status">Příspěvek byl uložen.</div><?php endif; ?>
  <?php if (isset($_GET['deleted'])): ?><div class="message success" role="status">Příspěvek byl smazán.</div><?php endif; ?>

  <section class="posts-card" aria-label="Seznam příspěvků">
    <?php if ($posts): ?><div class="posts-table-wrap"><table class="posts-table"><thead><tr><th>Článek</th><th>Stav</th><th>Datum</th><th>Akce</th></tr></thead><tbody>
    <?php foreach ($posts as $post): ?><tr>
      <td><a class="post-title" href="admin-edit.php?id=<?= (int)$post['id'] ?>"><?= e($post['title']) ?></a><span class="post-meta"><?= e($post['category'] ?: 'Bez kategorie') ?> · /<?= e($post['slug']) ?></span></td>
      <td><span class="status-badge <?= $post['published'] ? 'published' : 'draft' ?>"><?= $post['published'] ? 'Publikováno' : 'Koncept' ?></span></td>
      <td><time datetime="<?= e($post['published_at'] ?: $post['created_at']) ?>"><?= e(date('j. n. Y', strtotime($post['published_at'] ?: $post['created_at']))) ?></time></td>
      <td><div class="table-actions"><a class="button secondary compact" href="admin-edit.php?id=<?= (int)$post['id'] ?>">Upravit</a><form method="post" action="admin-delete.php" onsubmit="return confirm('Opravdu chcete tento příspěvek trvale smazat?');"><?= csrf_field() ?><input type="hidden" name="id" value="<?= (int)$post['id'] ?>"><button class="button danger compact" type="submit">Smazat</button></form></div></td>
    </tr><?php endforeach; ?>
    </tbody></table></div>
    <?php else: ?><div class="empty-state"><h2>Zatím tu není žádný příspěvek</h2><p>Vytvořte první článek a uložte jej jako koncept nebo ho rovnou publikujte.</p><a class="button primary" href="admin-edit.php">Vytvořit první příspěvek</a></div><?php endif; ?>
  </section>
</main>
</body>
</html>
