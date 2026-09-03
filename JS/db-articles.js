// Články z PHP/MariaDB administrace vložené do veřejného DevBlogu.
(function () {
  'use strict';
  const API_BASE = 'https://jakubryba.alwaysdata.net/api.php';
  const fmtDate = new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }
  function formatDate(value) {
    const date = new Date(String(value || '').replace(' ', 'T'));
    return Number.isNaN(date.getTime()) ? '' : fmtDate.format(date);
  }
  function shortPerex(value, max) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, '') + '…' : text;
  }
  function cssImageUrl(value) {
    return 'url("' + String(value).replace(/["\\\n\r]/g, '\\$&') + '")';
  }

  function postUrl(post) {
    return post.slug
      ? '/clanek/?slug=' + encodeURIComponent(post.slug)
      : '/clanek/?id=' + encodeURIComponent(post.id);
  }

  function articleImage(className, post) {
    const image = el('div', className + (post.image_url ? '' : ' db-image-placeholder'));
    image.setAttribute('role', 'img');
    image.setAttribute('aria-label', post.title);
    if (post.image_url) image.style.backgroundImage = cssImageUrl(post.image_url);
    return image;
  }

  function renderFeatured(post) {
    const card = document.getElementById('dbFeaturedArticle');
    if (!card || !post) return;
    const body = el('div', 'obsah');
    body.appendChild(el('h1', 'main-tittle', post.title));
    body.appendChild(el('p', 'notmain-tittle', shortPerex(post.excerpt, 150)));
    card.href = postUrl(post);
    card.replaceChildren(articleImage('imgs', post), body);
    card.hidden = false;
  }

  function renderSideCard(post) {
    const card = el('a', 'one-article');
    card.href = postUrl(post);
    const body = el('div', 'obsah2');
    body.appendChild(el('h3', 'main-tittle2mini', post.title));
    body.appendChild(el('p', 'notmain-tittle2', shortPerex(post.excerpt, 90)));
    card.append(articleImage('img2', post), body);
    return card;
  }

  function renderRankedCard(post, index) {
    const card = el('a', 'fulclanek');
    card.href = postUrl(post);
    const image = articleImage('obrazek99', post);
    image.appendChild(el('div', 'poradi9', String(index + 1) + '.'));
    const body = el('div', 'obsah99');
    body.appendChild(el('h3', 'maintext99', post.title));
    body.appendChild(el('p', 'notmain-tittle2', shortPerex(post.excerpt, 105)));
    card.append(image, body);
    return card;
  }

  function renderGridCard(post) {
    const card = el('a', 'dvojka-nejslab');
    card.href = postUrl(post);
    const body = el('div', 'pobsahh');
    body.appendChild(el('h3', 'main-minifour', post.title));
    body.appendChild(el('p', 'notmain-tittle2', shortPerex(post.excerpt, 120)));
    card.append(articleImage('test-img', post), body);
    return card;
  }

  async function loadArticleLists() {
    const homeStatus = document.getElementById('dbHomeStatus');
    const allStatus = document.getElementById('dbAllArticlesStatus');
    if (!homeStatus && !allStatus) return;
    try {
      const response = await fetch(API_BASE + '?limit=50', { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      const posts = Array.isArray(data.posts) ? data.posts : [];
      if (!posts.length) {
        const message = 'Zatím nebyl publikován žádný článek.';
        if (homeStatus) homeStatus.textContent = message;
        if (allStatus) allStatus.textContent = message;
        return;
      }

      if (homeStatus) {
        renderFeatured(posts[0]);
        const side = document.getElementById('dbHomeSideArticles');
        posts.slice(1, 4).forEach(function (post) { side.appendChild(renderSideCard(post)); });
        const remaining = posts.slice(4);
        const moreSection = document.getElementById('dbHomeMoreSection');
        const moreContainer = document.getElementById('dbHomeMoreArticles');
        remaining.slice(0, 3).forEach(function (post, index) { moreContainer.appendChild(renderRankedCard(post, index)); });
        if (remaining.length) moreSection.hidden = false;
        homeStatus.hidden = true;
      }

      if (allStatus) {
        const grid = document.getElementById('dbAllArticles');
        posts.forEach(function (post) { grid.appendChild(renderGridCard(post)); });
        allStatus.hidden = true;
      }
    } catch (_) {
      const message = 'Články se nepodařilo načíst. Zkuste stránku obnovit.';
      if (homeStatus) homeStatus.textContent = message;
      if (allStatus) allStatus.textContent = message;
    }
  }

  async function loadDetail() {
    const root = document.getElementById('dbArticleRoot');
    if (!root) return;
    const loading = document.getElementById('dbArticleLoading');
    const hideLoading = function () { if (loading) loading.hidden = true; };
    function showError(message, heading, pageTitle) {
      hideLoading();
      const h1 = root.querySelector('.mainte-top2');
      if (h1) h1.textContent = heading;
      document.title = pageTitle;
      const box = el('div', 'db-error');
      box.appendChild(el('p', 'db-error-title', message));
      const back = el('a', 'db-error-back', '← Zpět na hlavní stránku');
      back.href = '/';
      box.appendChild(back);
      root.appendChild(box);
    }

    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'), 10);
    const slug = params.get('slug');
    if ((!id || id < 1) && !slug) {
      showError('Chybí nebo je chybný identifikátor článku.', 'Článek nenalezen', 'Článek nenalezen | DevBlog');
      return;
    }
    try {
      const query = slug ? '?slug=' + encodeURIComponent(slug) : '?id=' + id;
      const response = await fetch(API_BASE + query, { headers: { Accept: 'application/json' } });
      if (response.status === 404) {
        showError('Takový článek tu není nebo zatím nebyl zveřejněn.', 'Článek nenalezen', 'Článek nenalezen | DevBlog');
        return;
      }
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      const post = data.post;
      document.title = post.title + ' | DevBlog';
      root.querySelector('.mainte-top2').textContent = post.title;
      root.querySelector('.spantext-top2').textContent = '(' + formatDate(post.published_at || post.created_at) + ')';
      const hero = document.getElementById('dbArticleImage');
      if (hero && post.image_url) {
        hero.style.backgroundImage = cssImageUrl(post.image_url);
        hero.classList.remove('image-programming-workspace');
        hero.setAttribute('aria-label', post.title);
        hero.hidden = false;
      }
      const content = document.getElementById('dbArticleContent');
      if (post.intro) content.appendChild(el('p', 'infote-mid2', post.intro));
      if (post.content_format === 'html') {
        const rich = el('div', 'db-rich-content');
        // API obsah před odesláním znovu čistí serverovým allowlistem.
        rich.innerHTML = String(post.content || '');
        content.appendChild(rich);
      } else {
        String(post.content || '').split(/\n{2,}/).forEach(function (raw) {
          const text = raw.trim();
          if (!text) return;
          const paragraph = el('p', 'notmat-mid2');
          text.split('\n').forEach(function (line, index) {
            if (index) paragraph.appendChild(document.createElement('br'));
            paragraph.appendChild(document.createTextNode(line));
          });
          content.appendChild(paragraph);
        });
      }
      hideLoading();
    } catch (_) {
      showError('Článek se nepodařilo načíst – zkuste stránku obnovit.', 'Něco se pokazilo', 'Chyba | DevBlog');
    }
  }
  loadArticleLists();
  loadDetail();
})();
