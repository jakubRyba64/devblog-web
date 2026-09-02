<?php
declare(strict_types=1);
require __DIR__ . '/db.php';
require __DIR__ . '/helpers.php';
session_start();
require_login();

$id = filter_var($_GET['id'] ?? 0, FILTER_VALIDATE_INT) ?: 0;
$post = null;
if ($id > 0) {
    $stmt = db()->prepare('SELECT * FROM posts WHERE id = ?');
    $stmt->execute([$id]);
    $post = $stmt->fetch();
    if (!$post) {
        http_response_code(404);
        exit('Příspěvek nenalezen.');
    }
}

$categories = article_categories();
$errors = [];
$title = (string)($post['title'] ?? '');
$slug = (string)($post['slug'] ?? '');
$intro = (string)($post['excerpt'] ?? '');
$category = (string)($post['category'] ?? $categories[0]);
$imagePath = (string)($post['featured_image'] ?? '');
$published = $post ? (bool)$post['published'] : false;
$dateValue = date('Y-m-d', strtotime((string)($post['published_at'] ?? $post['created_at'] ?? 'now')));
$contentFormat = (string)($post['content_format'] ?? 'plain');
$content = (string)($post['content'] ?? '');
$editorHtml = $contentFormat === 'html' ? sanitize_article_html($content) : legacy_content_to_html($content);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $title = trim((string)($_POST['title'] ?? ''));
    $slug = slugify(trim((string)($_POST['slug'] ?? '')) ?: $title);
    $intro = trim((string)($_POST['excerpt'] ?? ''));
    $category = trim((string)($_POST['category'] ?? ''));
    $imagePath = trim((string)($_POST['featured_image'] ?? ''));
    if (isset($_POST['remove_image'])) $imagePath = '';
    $dateValue = trim((string)($_POST['published_date'] ?? date('Y-m-d')));
    $editorHtml = sanitize_article_html((string)($_POST['content'] ?? ''));
    $action = (string)($_POST['action'] ?? 'draft');
    $published = $action === 'publish' || ($action === 'save' && ($_POST['status'] ?? '') === 'published');

    if ($title === '') $errors[] = 'Název článku nesmí být prázdný.';
    if (mb_strlen($title) > 255) $errors[] = 'Název může mít nejvýše 255 znaků.';
    if (mb_strlen($intro) > 600) $errors[] = 'Krátký úvod může mít nejvýše 600 znaků.';
    if (!in_array($category, $categories, true)) $errors[] = 'Vyberte platnou kategorii.';
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $dateValue);
    if (!$date || $date->format('Y-m-d') !== $dateValue) $errors[] = 'Zadejte platné datum publikace.';
    if (strlen($editorHtml) > 2 * 1024 * 1024) $errors[] = 'Obsah článku je příliš velký.';
    if ($published && trim(strip_tags($editorHtml)) === '' && !str_contains($editorHtml, '<img')) {
        $errors[] = 'Před publikací doplňte obsah článku.';
    }

    try {
        $uploaded = store_article_upload($_FILES['featured_image_file'] ?? []);
        if ($uploaded !== '') $imagePath = $uploaded;
    } catch (RuntimeException $e) {
        $errors[] = $e->getMessage();
    }
    if ($imagePath !== '' && post_image_url($imagePath) === null) $errors[] = 'Hlavní obrázek nemá platnou adresu.';

    if (!$errors) {
        $base = $slug;
        $suffix = 1;
        do {
            $stmt = db()->prepare('SELECT id FROM posts WHERE slug = ? AND id != ?');
            $stmt->execute([$slug, $id]);
            $exists = (bool)$stmt->fetch();
            if ($exists) $slug = $base . '-' . (++$suffix);
        } while ($exists);

        $existingPublishedAt = (string)($post['published_at'] ?? '');
        if ($existingPublishedAt !== '' && substr($existingPublishedAt, 0, 10) === $dateValue && substr($existingPublishedAt, 11) !== '00:00:00') {
            $publishedAt = $existingPublishedAt;
        } elseif ($dateValue === date('Y-m-d')) {
            $publishedAt = date('Y-m-d H:i:s');
        } else {
            $publishedAt = $dateValue . ' 00:00:00';
        }
        if ($id > 0) {
            $stmt = db()->prepare('UPDATE posts SET title = ?, slug = ?, excerpt = ?, category = ?, featured_image = ?, content = ?, content_format = ?, published = ?, published_at = ? WHERE id = ?');
            $stmt->execute([$title, $slug, $intro, $category, $imagePath ?: null, $editorHtml, 'html', (int)$published, $publishedAt, $id]);
        } else {
            $stmt = db()->prepare('INSERT INTO posts (title, slug, excerpt, category, featured_image, content, content_format, published, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())');
            $stmt->execute([$title, $slug, $intro, $category, $imagePath ?: null, $editorHtml, 'html', (int)$published, $publishedAt]);
            $id = (int)db()->lastInsertId();
        }
        header('Location: admin-edit.php?id=' . $id . '&saved=1');
        exit;
    }
}

$imageUrl = post_image_url($imagePath);
$publicUrl = frontend_url() . '/clanek/?slug=' . rawurlencode($slug);
?>
<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= $id ? 'Upravit příspěvek' : 'Nový příspěvek' ?> | DevBlog</title>
<link rel="stylesheet" href="admin.css">
<script src="admin-editor.js" defer></script>
</head>
<body class="admin-body">
<form id="postForm" class="editor-form" method="post" enctype="multipart/form-data">
<?= csrf_field() ?>
<input type="hidden" name="content" id="contentInput">
<input type="hidden" name="featured_image" id="featuredImagePath" value="<?= e($imagePath) ?>">
<input type="hidden" name="status" id="statusMirror" value="<?= $published ? 'published' : 'draft' ?>">

<header class="admin-header">
  <a class="admin-brand" href="admin.php" aria-label="DevBlog – příspěvky">Dev<span>Blog</span></a>
  <nav class="admin-nav" aria-label="Administrace">
    <a href="admin.php">Příspěvky</a>
    <a class="active" href="admin-edit.php">Nový příspěvek</a>
  </nav>
  <div class="header-actions">
    <button class="button secondary" type="submit" name="action" value="draft">Uložit koncept</button>
    <button class="button secondary" id="previewButton" type="submit" formaction="admin-preview.php" formtarget="_blank">Náhled</button>
    <button class="button primary" type="submit" name="action" value="publish">Publikovat</button>
  </div>
</header>

<main class="editor-shell">
  <div class="editor-heading-row">
    <div><p class="eyebrow"><?= $id ? 'Editace článku' : 'Nový článek' ?></p><h1><?= $id ? 'Upravit příspěvek' : 'Vytvořit nový příspěvek' ?></h1></div>
    <p class="save-state <?= isset($_GET['saved']) ? 'is-saved' : '' ?>" id="saveState" role="status"><span aria-hidden="true">✓</span><?= isset($_GET['saved']) ? 'Uloženo před chvílí' : 'Připraveno k úpravám' ?></p>
  </div>

  <?php if ($errors): ?><div class="message error" role="alert"><strong>Článek se nepodařilo uložit.</strong><ul><?php foreach ($errors as $error): ?><li><?= e($error) ?></li><?php endforeach; ?></ul></div><?php endif; ?>

  <div class="editor-layout">
    <section class="editor-card editor-main" aria-label="Obsah příspěvku">
      <label class="field-label" for="title">Název článku <span>*</span></label>
      <input id="title" name="title" type="text" maxlength="255" required value="<?= e($title) ?>" placeholder="Jak se naučit programovat">

      <label class="field-label" for="slug">URL adresa</label>
      <div class="slug-field"><span><?= e(parse_url(frontend_url(), PHP_URL_HOST) ?: 'devblog.cz') ?>/clanek/?slug=</span><input id="slug" name="slug" type="text" maxlength="255" value="<?= e($slug) ?>" placeholder="jak-se-naucit-programovat"></div>

      <label class="field-label" for="excerpt">Krátký úvod</label>
      <textarea id="excerpt" name="excerpt" rows="3" maxlength="600" placeholder="Stručně představte obsah článku…"><?= e($intro) ?></textarea>

      <div class="field-label">Hlavní obrázek</div>
      <div class="image-dropzone <?= $imageUrl ? 'has-image' : '' ?>" id="imageDropzone" tabindex="0" role="button" aria-label="Vybrat hlavní obrázek">
        <input id="featuredImageFile" name="featured_image_file" type="file" accept="image/jpeg,image/png,image/webp" hidden>
        <img id="featuredImagePreview" src="<?= e($imageUrl ?? '') ?>" alt="Náhled hlavního obrázku" <?= $imageUrl ? '' : 'hidden' ?>>
        <div class="dropzone-empty" id="dropzoneEmpty" <?= $imageUrl ? 'hidden' : '' ?>><span class="image-icon" aria-hidden="true">▧</span><p>Přetáhněte obrázek nebo <u>vyberte soubor</u></p><span class="button secondary compact">Vybrat obrázek</span><small>JPG, PNG nebo WebP, maximálně 5 MB</small></div>
        <button class="remove-image" id="removeImage" type="button" <?= $imageUrl ? '' : 'hidden' ?>>Odebrat obrázek</button>
      </div>
      <input id="removeImageInput" type="hidden" name="remove_image" value="">

      <label class="field-label" for="articleEditor">Obsah článku <span>*</span></label>
      <div class="rich-editor">
        <div class="editor-toolbar" role="toolbar" aria-label="Formátování článku">
          <select id="blockFormat" aria-label="Typ odstavce"><option value="p">Odstavec</option><option value="h2">Nadpis 2</option><option value="h3">Nadpis 3</option><option value="blockquote">Citace</option><option value="pre">Kód</option></select>
          <span class="toolbar-divider"></span>
          <button type="button" data-command="bold" aria-label="Tučně"><strong>B</strong></button><button type="button" data-command="italic" aria-label="Kurzíva"><em>I</em></button><button type="button" data-action="link" aria-label="Vložit odkaz">↗</button>
          <span class="toolbar-divider"></span>
          <button type="button" data-command="insertUnorderedList" aria-label="Odrážkový seznam">☷</button><button type="button" data-command="insertOrderedList" aria-label="Číslovaný seznam">☰</button><button type="button" data-command="formatBlock" data-value="blockquote" aria-label="Citace">❝</button><button type="button" data-action="inline-image" aria-label="Vložit obrázek">▧</button><button type="button" data-command="formatBlock" data-value="pre" aria-label="Blok kódu">&lt;/&gt;</button>
        </div>
        <div id="articleEditor" class="article-editor" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="Začněte psát článek…"><?= $editorHtml ?></div>
        <input id="inlineImageFile" type="file" accept="image/jpeg,image/png,image/webp" hidden>
      </div>
    </section>

    <aside class="editor-card publication-card">
      <h2>Nastavení publikace</h2>
      <label class="field-label" for="statusSelect">Stav</label>
      <select id="statusSelect"><option value="draft" <?= !$published ? 'selected' : '' ?>>Koncept</option><option value="published" <?= $published ? 'selected' : '' ?>>Publikováno</option></select>
      <label class="field-label" for="category">Kategorie <span>*</span></label>
      <select id="category" name="category" required><?php foreach ($categories as $option): ?><option value="<?= e($option) ?>" <?= $category === $option ? 'selected' : '' ?>><?= e($option) ?></option><?php endforeach; ?></select>
      <label class="field-label" for="publishedDate">Datum publikování</label>
      <input id="publishedDate" name="published_date" type="date" value="<?= e($dateValue) ?>" required>

      <div class="preview-section"><h3>Náhled článku</h3><article class="article-card-preview"><div class="preview-image-wrap"><img id="cardImage" src="<?= e($imageUrl ?? '') ?>" alt="" <?= $imageUrl ? '' : 'hidden' ?>><div id="cardImagePlaceholder" class="preview-placeholder" <?= $imageUrl ? 'hidden' : '' ?>>Dev<span>Blog</span></div></div><div class="preview-copy"><small id="cardCategory"><?= e($category) ?></small><h4 id="cardTitle"><?= e($title ?: 'Název vašeho článku') ?></h4><p id="cardExcerpt"><?= e($intro ?: 'Krátký úvod se zobrazí v náhledu článku.') ?></p></div></article></div>

      <button class="button primary publish-wide" type="submit" name="action" value="publish">Publikovat</button>
      <?php if ($id > 0 && $slug !== '' && $published): ?><a class="public-link" href="<?= e($publicUrl) ?>" target="_blank" rel="noopener">Otevřít veřejný článek ↗</a><?php endif; ?>
    </aside>
  </div>
</main>
</form>
</body>
</html>
