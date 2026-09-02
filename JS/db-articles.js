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

  async function loadLatestIntoHome() {
    const slot = document.getElementById('dbLatestArticle');
    if (!slot) return;
    try {
      const response = await fetch(API_BASE + '?limit=1', { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      const post = data.posts && data.posts[0];
      if (!post) return;
      slot.href = post.slug ? '/clanek/?slug=' + encodeURIComponent(post.slug) : '/clanek/?id=' + encodeURIComponent(post.id);
      const image = el('div', 'img2 image-web-development');
      image.setAttribute('role', 'img');
      image.setAttribute('aria-label', post.title);
      if (post.image_url) image.style.backgroundImage = cssImageUrl(post.image_url);
      const body = el('div', 'obsah2');
      body.appendChild(el('h3', 'main-tittle2mini', post.title));
      body.appendChild(el('p', 'notmain-tittle2', shortPerex(post.excerpt, 90)));
      slot.replaceChildren(image, body);
      slot.hidden = false;
    } catch (_) {
      // Při nedostupném API zůstane dynamická karta skrytá.
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
  loadLatestIntoHome();
  loadDetail();
})();
