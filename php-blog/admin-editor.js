(function () {
  'use strict';

  const form = document.getElementById('postForm');
  if (!form) return;

  const editor = document.getElementById('articleEditor');
  const contentInput = document.getElementById('contentInput');
  const title = document.getElementById('title');
  const slug = document.getElementById('slug');
  const excerpt = document.getElementById('excerpt');
  const category = document.getElementById('category');
  const statusSelect = document.getElementById('statusSelect');
  const statusMirror = document.getElementById('statusMirror');
  const saveState = document.getElementById('saveState');
  const imageInput = document.getElementById('featuredImageFile');
  const imageDropzone = document.getElementById('imageDropzone');
  const imagePreview = document.getElementById('featuredImagePreview');
  const imagePath = document.getElementById('featuredImagePath');
  const removeImage = document.getElementById('removeImage');
  const removeImageInput = document.getElementById('removeImageInput');
  const dropzoneEmpty = document.getElementById('dropzoneEmpty');
  const cardImage = document.getElementById('cardImage');
  const cardImagePlaceholder = document.getElementById('cardImagePlaceholder');
  const inlineImageInput = document.getElementById('inlineImageFile');
  let slugWasEdited = slug.value.trim() !== '';
  let featuredUpload = null;

  document.execCommand('defaultParagraphSeparator', false, 'p');

  function slugify(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 255);
  }

  function markDirty() {
    saveState.classList.add('is-dirty');
    saveState.classList.remove('is-saved');
    saveState.lastChild.textContent = 'Neuložené změny';
  }

  function updateCard() {
    document.getElementById('cardTitle').textContent = title.value.trim() || 'Název vašeho článku';
    document.getElementById('cardExcerpt').textContent = excerpt.value.trim() || 'Krátký úvod se zobrazí v náhledu článku.';
    document.getElementById('cardCategory').textContent = category.value;
  }

  function showImage(url) {
    imagePreview.src = url;
    imagePreview.hidden = false;
    dropzoneEmpty.hidden = true;
    removeImage.hidden = false;
    imageDropzone.classList.add('has-image');
    cardImage.src = url;
    cardImage.hidden = false;
    cardImagePlaceholder.hidden = true;
  }

  async function chooseFeatured(file) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 5 * 1024 * 1024) {
      window.alert('Vyberte JPG, PNG nebo WebP obrázek do velikosti 5 MB.');
      imageInput.value = '';
      return;
    }
    removeImageInput.value = '';
    showImage(URL.createObjectURL(file));
    markDirty();

    const data = new FormData();
    data.append('csrf', form.querySelector('[name="csrf"]').value);
    data.append('image', file);
    saveState.lastChild.textContent = 'Nahrávám obrázek…';
    featuredUpload = fetch('admin-upload.php', { method: 'POST', body: data, credentials: 'same-origin' })
      .then(async function (response) {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Nahrání obrázku selhalo.');
        imagePath.value = result.path;
        imageInput.value = '';
        showImage(result.url);
        saveState.lastChild.textContent = 'Obrázek nahrán';
      })
      .catch(function (error) {
        imagePath.value = '';
        imageInput.value = '';
        window.alert(error.message);
        throw error;
      })
      .finally(function () { featuredUpload = null; });
    return featuredUpload;
  }

  title.addEventListener('input', function () {
    if (!slugWasEdited) slug.value = slugify(title.value);
    updateCard();
    markDirty();
  });
  slug.addEventListener('input', function () { slugWasEdited = slug.value.trim() !== ''; markDirty(); });
  excerpt.addEventListener('input', function () { updateCard(); markDirty(); });
  category.addEventListener('change', function () { updateCard(); markDirty(); });
  statusSelect.addEventListener('change', function () { statusMirror.value = statusSelect.value; markDirty(); });

  imageDropzone.addEventListener('click', function (event) {
    if (event.target !== removeImage) imageInput.click();
  });
  imageDropzone.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); imageInput.click(); }
  });
  imageInput.addEventListener('change', function () { void chooseFeatured(imageInput.files[0]).catch(function () {}); });
  ['dragenter', 'dragover'].forEach(function (name) {
    imageDropzone.addEventListener(name, function (event) { event.preventDefault(); imageDropzone.classList.add('is-dragging'); });
  });
  ['dragleave', 'drop'].forEach(function (name) {
    imageDropzone.addEventListener(name, function (event) { event.preventDefault(); imageDropzone.classList.remove('is-dragging'); });
  });
  imageDropzone.addEventListener('drop', function (event) { void chooseFeatured(event.dataTransfer.files[0]).catch(function () {}); });
  removeImage.addEventListener('click', function (event) {
    event.stopPropagation();
    imageInput.value = '';
    imagePath.value = '';
    removeImageInput.value = '1';
    imagePreview.src = '';
    imagePreview.hidden = true;
    dropzoneEmpty.hidden = false;
    removeImage.hidden = true;
    cardImage.src = '';
    cardImage.hidden = true;
    cardImagePlaceholder.hidden = false;
    markDirty();
  });

  document.querySelectorAll('[data-command]').forEach(function (button) {
    button.addEventListener('mousedown', function (event) { event.preventDefault(); });
    button.addEventListener('click', function () {
      editor.focus();
      const value = button.dataset.value || null;
      document.execCommand(button.dataset.command, false, value);
      markDirty();
    });
  });
  document.getElementById('blockFormat').addEventListener('change', function (event) {
    editor.focus();
    document.execCommand('formatBlock', false, event.target.value);
    event.target.value = 'p';
    markDirty();
  });
  document.querySelector('[data-action="link"]').addEventListener('click', function () {
    const url = window.prompt('Vložte adresu odkazu (https://…):');
    if (url && /^(https?:\/\/|mailto:|#|\/)/i.test(url.trim())) {
      editor.focus(); document.execCommand('createLink', false, url.trim()); markDirty();
    } else if (url) window.alert('Zadejte bezpečnou webovou adresu.');
  });
  document.querySelector('[data-action="inline-image"]').addEventListener('click', function () { inlineImageInput.click(); });

  async function uploadInlineImage(file) {
    if (!file) return;
    const data = new FormData();
    data.append('csrf', form.querySelector('[name="csrf"]').value);
    data.append('image', file);
    try {
      const response = await fetch('admin-upload.php', { method: 'POST', body: data, credentials: 'same-origin' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Nahrání obrázku selhalo.');
      editor.focus();
      document.execCommand('insertImage', false, result.url);
      markDirty();
    } catch (error) {
      window.alert(error.message);
    }
  }
  inlineImageInput.addEventListener('change', function () { uploadInlineImage(inlineImageInput.files[0]); inlineImageInput.value = ''; });
  editor.addEventListener('input', markDirty);

  form.addEventListener('submit', async function (event) {
    if (featuredUpload) {
      event.preventDefault();
      const pendingSubmitter = event.submitter;
      try {
        await featuredUpload;
        if (pendingSubmitter) form.requestSubmit(pendingSubmitter);
      } catch (_) {
        // Chyba už byla zobrazena; formulář bez obrázku neodesíláme.
      }
      return;
    }
    contentInput.value = editor.innerHTML;
    const submitter = event.submitter;
    if (submitter && submitter.id === 'previewButton') return;
    if (submitter && submitter.value === 'publish') statusMirror.value = 'published';
    if (submitter && submitter.value === 'draft') statusMirror.value = 'draft';
  });
})();
