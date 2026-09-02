<?php
declare(strict_types=1);
require __DIR__ . '/db.php';
require __DIR__ . '/helpers.php';
session_start();

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $stmt = db()->prepare('SELECT * FROM users WHERE username = ?');
    $stmt->execute([trim($_POST['username'] ?? '')]);
    $user = $stmt->fetch();

    if ($user && password_verify($_POST['password'] ?? '', $user['password_hash'])) {
        session_regenerate_id(true);          // ochrana proti session fixation
        $_SESSION['user_id']  = (int)$user['id'];
        $_SESSION['username'] = $user['username'];
        header('Location: admin.php');
        exit;
    }
    $error = 'Nesprávné uživatelské jméno nebo heslo.';
}
?>
<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Přihlášení – <?= e(SITE_NAME) ?></title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="top">
  <h1><a href="index.php"><?= e(SITE_NAME) ?></a></h1>
</header>
<main>
  <h2>Přihlášení do administrace</h2>
  <?php if ($error): ?><div class="alert"><?= e($error) ?></div><?php endif; ?>
  <form method="post" class="stack">
    <?= csrf_field() ?>
    <label>Uživatelské jméno
      <input type="text" name="username" required autofocus value="<?= e($_POST['username'] ?? '') ?>">
    </label>
    <label>Heslo
      <input type="password" name="password" required>
    </label>
    <div class="row">
      <button class="btn">Přihlásit se</button>
      <a class="muted" href="index.php">← Zpět na blog</a>
    </div>
  </form>
</main>
</body>
</html>
