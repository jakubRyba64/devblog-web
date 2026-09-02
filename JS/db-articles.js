// --- ČLÁNKY Z DATABÁZE (PHP blog na Alwaysdata = headless CMS pro DevBlog) ---
// Načítá publikované články z JSON API a vkládá je do zeleného DevBlog designu.
// Všechna data se vkládají přes textContent/createElement => ochrana proti XSS.

(function () {
    'use strict';

    const API_BASE = 'https://jakubryba.alwaysdata.net/api.php';

    const fmtDate = new Intl.DateTimeFormat('cs-CZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    function formatDate(iso) {
        const d = new Date(iso);
        return isNaN(d.getTime()) ? '' : fmtDate.format(d);
    }

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) node.textContent = text;
        return node;
    }

    /* =======================================================
       HOMEPAGE – výpis nejnovějších článků (#dbArticles)
       ======================================================= */

    function renderCard(post) {
        const link = el('a', 'one-article db-card');
        link.href = '/clanek/?id=' + encodeURIComponent(post.id);
        link.style.textDecoration = 'none';
        link.style.color = 'inherit';

        const meta = el('p', 'db-card-date', formatDate(post.created_at));
        const title = el('h3', 'main-tittle2mini', post.title);
        const perex = el('p', 'notmain-tittle2', post.excerpt);

        const body = el('div', 'obsah2');
        body.appendChild(meta);
        body.appendChild(title);
        body.appendChild(perex);
        link.appendChild(body);
        return link;
    }

    async function loadHomeList() {
        const grid = document.getElementById('dbArticles');
        if (!grid) return;

        try {
            const res = await fetch(API_BASE + '?limit=6', {
                headers: { Accept: 'application/json' }
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();

            grid.innerHTML = '';

            if (!data.posts || data.posts.length === 0) {
                grid.appendChild(el('p', 'db-empty',
                    'Zatím tu žádný článek není – první brzy přibude. ✍️'));
                return;
            }

            data.posts.forEach((post) => grid.appendChild(renderCard(post)));
        } catch (err) {
            // API nedostupné => celou sekci tiše skryj, ať nezůstává viset "Načítám…"
            const section = grid.closest('section');
            if (section) section.style.display = 'none';
        }
    }

    /* =======================================================
       DETAIL ČLÁNKU – /clanek/?id=X  (#dbArticleRoot)
       ======================================================= */

    async function loadDetail() {
        const root = document.getElementById('dbArticleRoot');
        if (!root) return;

        const loading = document.getElementById('dbArticleLoading');
        const hideLoading = () => { if (loading) loading.hidden = true; };

        const showError = (message, h1Text, titleText) => {
            hideLoading();
            const h1 = root.querySelector('.mainte-top2');
            if (h1 && h1Text) h1.textContent = h1Text;
            document.title = titleText;

            const box = el('div', 'db-error');
            box.appendChild(el('p', 'db-error-title', message));
            const back = el('a', 'db-error-back', '← Zpět na hlavní stránku');
            back.href = '/';
            box.appendChild(back);
            root.appendChild(box);
        };

        const params = new URLSearchParams(window.location.search);
        const id = parseInt(params.get('id'), 10);

        if (!id || id < 1) {
            showError('Chybí nebo je chybný identifikátor článku.',
                'Článek nenalezen', 'Článek nenalezen | DevBlog');
            return;
        }

        try {
            const res = await fetch(API_BASE + '?id=' + id, {
                headers: { Accept: 'application/json' }
            });

            if (res.status === 404) {
                showError('Takový článek tu bohužel není (nebo zatím nebyl zveřejněn).',
                    'Článek nenalezen', 'Článek nenalezen | DevBlog');
                return;
            }
            if (!res.ok) throw new Error('HTTP ' + res.status);

            const data = await res.json();
            const post = data.post;

            document.title = post.title + ' | DevBlog';
            root.querySelector('.mainte-top2').textContent = post.title;
            root.querySelector('.spantext-top2').textContent =
                '(' + formatDate(post.created_at) + ')';

            const content = document.getElementById('dbArticleContent');

            // Obsah: prázdný řádek = odstavec, enter = nový řádek (stejně jako v PHP blogu).
            const paragraphs = String(post.content).split(/\n{2,}/);
            paragraphs.forEach((raw, i) => {
                const text = raw.trim();
                if (!text) return;

                const p = el('p', i === 0 ? 'infote-mid2' : 'notmat-mid2');
                text.split('\n').forEach((line, j) => {
                    if (j > 0) p.appendChild(document.createElement('br'));
                    p.appendChild(document.createTextNode(line));
                });
                content.appendChild(p);
            });

            hideLoading();
        } catch (err) {
            showError('Článek se nepodařilo načíst – zkuste stránku obnovit.',
                'Něco se pokazilo', 'Chyba | DevBlog');
        }
    }

    loadHomeList();
    loadDetail();
})();
