<?php
declare(strict_types=1);
require __DIR__ . '/db.php';
require __DIR__ . '/helpers.php';
session_start();
require_login();

$posts = db()->query(
    'SELECT id, title, slug, published, created_at
     FROM posts
     ORDER BY created_at DESC'
)->fetchAll();
?>
<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Administrace – <?= e(SITE_NAME) ?></title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="top">
  <h1><a href="index.php"><?= e(SITE_NAME) ?></a></h1>
  <nav class="row">
    <span class="muted">👋 <?= e($_SESSION['username'] ?? '') ?></span>
    <a href="logout.php">Odhlásit se</a>
  </nav>
</header>
<main>
  <div class="toolbar">
    <h2>Správa příspěvků</h2>
    <a class="btn" href="admin-edit.php">+ Nový příspěvek</a>
  </div>

  <?php if (isset($_GET['saved'])): ?><div class="ok">Příspěvek uložen ✅</div><?php endif; ?>
  <?php if (isset($_GET['deleted'])): ?><div class="ok">Příspěvek smazán 🗑️</div><?php endif; ?>

  <table class="list">
    <tr><th>Titulek</th><th>Stav</th><th>Vytvořeno</th><th>Akce</th></tr>
    <?php foreach ($posts as $p): ?>
    <tr>
      <td><a href="admin-edit.php?id=<?= (int)$p['id'] ?>"><?= e($p['title']) ?></a></td>
      <td><span class="badge <?= $p['published'] ? 'pub' : 'draft' ?>"><?= $p['published'] ? 'veřejný' : 'koncept' ?></span></td>
      <td class="muted"><?= e(date('j. n. Y H:i', strtotime($p['created_at']))) ?></td>
      <td>
        <div class="row">
          <a class="btn small ghost" href="admin-edit.php?id=<?= (int)$p['id'] ?>">Upravit</a>
          <form method="post" action="admin-delete.php" onsubmit="return confirm('Opravdu smazat tento příspěvek?');">
            <?= csrf_field() ?>
            <input type="hidden" name="id" value="<?= (int)$p['id'] ?>">
            <button class="btn small danger">Smazat</button>
          </form>
        </div>
      </td>
    </tr>
    <?php endforeach; ?>
    <?php if (!$posts): ?><tr><td colspan="4" class="muted">Zatím žádné příspěvky – napiš první!</td></tr><?php endif; ?>
  </table>
</main>
</body>
</html>
