<?php
/**
 * JEDNORÁZOVÁ instalace admin účtu.
 * - Odmítne se spustit, pokud už nějaký uživatel existuje, nebo exists install.lock.
 * - Po úspěchu vytvoří install.lock.
 * Po instalaci: soubor install.php ze serveru SMAZAT.
 */
declare(strict_types=1);
require __DIR__ . '/db.php';
require __DIR__ . '/helpers.php';
session_start();

$lock = __DIR__ . '/install.lock';
$done  = false;
$error = '';

$hasUsers = (bool)db()->query('SELECT COUNT(*) AS c FROM users')->fetch()['c'];
if ($hasUsers || file_exists($lock)) {
    http_response_code(403);
    exit('Instalace už proběhla. Smažte install.php (a install.lock) ze serveru.');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $u  = trim($_POST['username'] ?? '');
    $p  = $_POST['password'] ?? '';
    $p2 = $_POST['password2'] ?? '';

    if (!preg_match('~^[a-zA-Z0-9_.-]{3,50}$~', $u)) {
        $error = 'Uživatelské jméno: 3–50 znaků (písmena, čísla, tečka, podtržítko, pomlčka).';
    } elseif (strlen($p) < 8) {
        $error = 'Heslo musí mít alespoň 8 znaků.';
    } elseif ($p !== $p2) {
        $error = 'Hesla se neshodují.';
    } else {
        db()->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
            ->execute([$u, password_hash($p, PASSWORD_DEFAULT)]);
        file_put_contents($lock, date('c'));
        $done = true;
    }
}
?>
<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Instalace – <?= e(SITE_NAME) ?></title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="top"><h1><a href="index.php"><?= e(SITE_NAME) ?></a></h1></header>
<main>
<?php if ($done): ?>
  <div class="ok">Admin účet vytvořen ✅ <br>Nyní si můžeš <a href="login.php">přihlásit</a>.
    <br><strong>Nezapomeň smazat install.php ze serveru!</strong></div>
<?php else: ?>
  <h2>První instalace – vytvoření admin účtu</h2>
  <?php if ($error): ?><div class="alert"><?= e($error) ?></div><?php endif; ?>
  <form method="post" class="stack">
    <?= csrf_field() ?>
    <label>Uživatelské jméno admina
      <input type="text" name="username" required autofocus>
    </label>
    <label>Heslo (min. 8 znaků)
      <input type="password" name="password" required minlength="8">
    </label>
    <label>Heslo znovu
      <input type="password" name="password2" required minlength="8">
    </label>
    <div class="row"><button class="btn">Vytvořit admin účet</button></div>
  </form>
<?php endif; ?>
</main>
</body>
</html>
