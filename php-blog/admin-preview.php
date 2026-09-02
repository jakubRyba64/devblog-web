<?php
declare(strict_types=1);
require __DIR__ . '/db.php';
require __DIR__ . '/helpers.php';
session_start();
require_login();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    header('Location: admin.php');
    exit;
}
csrf_check();

$title = trim((string)($_POST['title'] ?? '')) ?: 'Náhled článku';
$intro = trim((string)($_POST['excerpt'] ?? ''));
$category = trim((string)($_POST['category'] ?? ''));
$dateValue = trim((string)($_POST['published_date'] ?? date('Y-m-d')));
$content = sanitize_article_html((string)($_POST['content'] ?? ''));
$imageUrl = post_image_url(trim((string)($_POST['featured_image'] ?? '')));

// Nově vybraný hlavní obrázek se v náhledu zobrazí přímo z dočasného uploadu;
// náhled ho neukládá na server a nevytváří osiřelé soubory.
$previewFile = $_FILES['featured_image_file'] ?? [];
if ((int)($previewFile['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK
    && (int)($previewFile['size'] ?? 0) <= 5 * 1024 * 1024) {
    $tmp = (string)($previewFile['tmp_name'] ?? '');
    $mime = $tmp !== '' ? (new finfo(FILEINFO_MIME_TYPE))->file($tmp) : false;
    if ($mime && in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)
        && @getimagesize($tmp) !== false) {
        $imageUrl = 'data:' . $mime . ';base64,' . base64_encode((string)file_get_contents($tmp));
    }
}
?>
<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Náhled: <?= e($title) ?> | DevBlog</title>
<style>
*{box-sizing:border-box}body{margin:0;color:#242424;font-family:Arial,sans-serif;line-height:1.7}header{height:72px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid #e3e8e6}.brand{font-size:26px;text-decoration:none}.brand span{color:#158a70;font-style:italic;font-weight:700}.notice{padding:10px;text-align:center;background:#edf8f5;color:#08725d;font-weight:700}.article{width:min(930px,calc(100% - 36px));margin:45px auto 90px}.category{color:#158a70;font-weight:700;font-size:13px;text-transform:uppercase}.article h1{margin:8px 0 12px;font-size:clamp(32px,6vw,58px);line-height:1.08;letter-spacing:-.04em}.meta{color:#78817f;font-size:14px}.hero{width:100%;max-height:520px;object-fit:cover;margin:28px 0;border-radius:3px}.intro{margin:30px 0;padding:22px 0;border-block:1px solid #dce4e1;font-size:19px;font-style:italic}.content{font-size:17px}.content h2{margin-top:40px;font-size:28px}.content h3{margin-top:34px;padding-left:12px;border-left:3px solid #158a70;font-size:22px}.content img{max-width:100%;height:auto}.content blockquote{margin:25px 0;padding:16px 22px;border-left:3px solid #158a70;background:#edf8f5}.content pre{overflow:auto;padding:18px;border-radius:5px;background:#172027;color:#eff7f5}@media(max-width:600px){.article{margin-top:28px}.article h1{font-size:34px}.content{font-size:16px}}
</style>
</head>
<body>
<header><a class="brand" href="#">Dev<span>Blog</span></a></header>
<div class="notice">Toto je pouze náhled. Článek zatím nebyl uložen ani publikován.</div>
<article class="article">
  <?php if ($category !== ''): ?><div class="category"><?= e($category) ?></div><?php endif; ?>
  <h1><?= e($title) ?></h1>
  <div class="meta">Publikováno <?= e(date('j. n. Y', strtotime($dateValue))) ?></div>
  <?php if ($imageUrl): ?><img class="hero" src="<?= e($imageUrl) ?>" alt="<?= e($title) ?>"><?php endif; ?>
  <?php if ($intro !== ''): ?><p class="intro"><?= e($intro) ?></p><?php endif; ?>
  <div class="content"><?= $content ?></div>
</article>
</body>
</html>
