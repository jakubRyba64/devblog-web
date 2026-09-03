// --- MOBILE MENU TOGGLE ---

const DEV_BLOG_API = 'https://jakubryba.alwaysdata.net/api.php';
const DEV_BLOG_NEWSLETTER = 'https://jakubryba.alwaysdata.net/newsletter.php';

// Funkce označené během vývoje jako dočasné jsou nyní zapojené níže.
document.querySelectorAll('.not-ready').forEach((element) => {
    element.classList.remove('not-ready');
    element.removeAttribute('aria-disabled');
    if (element.getAttribute('title') === 'Zatím není dostupné') element.removeAttribute('title');
});

const menuBtn = document.querySelector(".nav-hammenu-1a");
const menuOverlay = document.getElementById("mobileMenu");
const menuClose = document.getElementById("mobileMenuClose");

if (menuBtn && menuOverlay && menuClose) {
    menuBtn.addEventListener("click", () => {
        menuOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
    });

    menuClose.addEventListener("click", () => {
        menuOverlay.classList.remove("active");
        document.body.style.overflow = "auto";
    });
}

// --- SEARCH AUTOCOMPLETE + MOBILE/TABLET SEARCH PANEL ---

const navSearchInput = document.getElementById("navSearchInput");
const navSearchResults = document.getElementById("navSearchResults");

if (navSearchInput && navSearchResults) {
    let searchPosts = [];
    let visibleSearchPosts = [];

    fetch(DEV_BLOG_API + '?limit=50', { headers: { Accept: 'application/json' } })
        .then((response) => response.ok ? response.json() : Promise.reject(new Error('HTTP ' + response.status)))
        .then((data) => { searchPosts = Array.isArray(data.posts) ? data.posts : []; })
        .catch(() => { searchPosts = []; });

    const createResultItem = (post) => {
        const li = document.createElement("li");

        const label = document.createElement("span");
        label.textContent = post.title;

        const icon = document.createElement("img");
        icon.src = "/assets/pictures/icon-search.svg";
        icon.alt = "Hledat";

        li.appendChild(label);
        li.appendChild(icon);

        li.addEventListener("click", () => {
            window.location.href = '/clanek/?slug=' + encodeURIComponent(post.slug);
        });

        return li;
    };

    const updateResults = (query) => {
        navSearchResults.innerHTML = "";

        const trimmed = query.trim().toLowerCase();
        if (!trimmed) {
            navSearchResults.classList.remove("show");
            return;
        }

        visibleSearchPosts = searchPosts.filter((post) =>
            [post.title, post.excerpt, post.category].join(' ').toLowerCase().includes(trimmed)
        ).slice(0, 6);

        if (visibleSearchPosts.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'search-empty';
            empty.textContent = 'Žádný článek nenalezen';
            navSearchResults.appendChild(empty);
            navSearchResults.classList.add("show");
            return;
        }

        visibleSearchPosts.forEach((post) => {
            navSearchResults.appendChild(createResultItem(post));
        });

        navSearchResults.classList.add("show");
    };

    navSearchInput.addEventListener("input", (e) => {
        updateResults(e.target.value);
    });

    navSearchInput.addEventListener("keydown", (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (visibleSearchPosts[0]) window.location.href = '/clanek/?slug=' + encodeURIComponent(visibleSearchPosts[0].slug);
        }
        if (e.key === "Escape") {
            navSearchResults.classList.remove("show");
            navSearchInput.blur();
        }
    });

    const searchButton = navSearchInput.closest('form')?.querySelector('button');
    if (searchButton) searchButton.addEventListener('click', () => {
        if (visibleSearchPosts[0]) window.location.href = '/clanek/?slug=' + encodeURIComponent(visibleSearchPosts[0].slug);
        else updateResults(navSearchInput.value);
    });

    // zavření dropdownu při kliknutí mimo
    document.addEventListener("click", (e) => {
        if (
            !navSearchInput.contains(e.target) &&
            !navSearchResults.contains(e.target)
        ) {
            navSearchResults.classList.remove("show");
        }
    });

    // --- MOBILE/TABLET SEARCH PANEL TOGGLE (0–1026 px) ---

    const navBar = document.querySelector(".nav-logmenu-1a");
    const mobileSearchBtn = document.querySelector(".nav-search-1a");
    const mobileSearchClose = document.querySelector(".nav-search-close-1a");

    const openMobileSearch = () => {
        if (!navBar || window.innerWidth > 1026) return;
        navBar.classList.add("search-open");
        document.body.style.overflow = "hidden";
        navSearchInput.focus();
    };

    const closeMobileSearch = () => {
        if (!navBar) return;
        navBar.classList.remove("search-open");
        document.body.style.overflow = "auto";
        navSearchInput.value = "";
        navSearchResults.classList.remove("show");
    };

    if (mobileSearchBtn) {
        mobileSearchBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openMobileSearch();
        });
    }

    if (mobileSearchClose) {
        mobileSearchClose.addEventListener("click", (e) => {
            e.preventDefault();
            closeMobileSearch();
        });
    }

    window.addEventListener("resize", () => {
        if (window.innerWidth > 1026) {
            closeMobileSearch();
        }
    });
}

// --- NEWSLETTER ---
(function () {
    const forms = document.querySelectorAll('.mainnewsl, .mainnewsl-top2, .news-fot-fot');

    function focusNewsletter() {
        const form = forms[0];
        if (!form) return;
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = form.querySelector('input[type="email"]');
        if (input) window.setTimeout(() => input.focus(), 450);
    }

    document.querySelectorAll('.nav-subbtn-1a, .mobile-subscribe-btn').forEach((button) => {
        button.addEventListener('click', focusNewsletter);
    });

    forms.forEach((form) => {
        const input = form.querySelector('input[type="email"]');
        const button = form.querySelector('button[type="submit"]');
        if (!input || !button) return;
        let status = form.querySelector('.newsletter-status');
        if (!status) {
            status = document.createElement('p');
            status.className = 'newsletter-status';
            status.setAttribute('role', 'status');
            form.appendChild(status);
        }
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!input.checkValidity()) { input.reportValidity(); return; }
            button.disabled = true;
            status.textContent = 'Přihlašuji…';
            try {
                const data = new FormData();
                data.append('email', input.value.trim());
                const response = await fetch(DEV_BLOG_NEWSLETTER, { method: 'POST', body: data });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Přihlášení se nepodařilo.');
                status.textContent = result.message;
                input.value = '';
            } catch (error) {
                status.textContent = error.message;
            } finally {
                button.disabled = false;
            }
        });
    });
})();

(function () {
    const clearButton = document.getElementById('clearLocalPreferences');
    if (!clearButton) return;
    clearButton.addEventListener('click', () => {
        Object.keys(localStorage).filter((key) => key.startsWith('devblog-bookmark:')).forEach((key) => localStorage.removeItem(key));
        const status = document.getElementById('privacySettingsStatus');
        if (status) status.textContent = 'Uložené záložky byly z tohoto prohlížeče odstraněny.';
    });
})();

// --- TEMPORARY UNAVAILABLE POPUP ---

const unavPopup = document.getElementById("unavailablePopup");
const unavClose = document.getElementById("unavCloseBtn");
const unavCloseUnder = document.getElementById("unavCloseUnder");
const unavTriggers = document.querySelectorAll(".not-ready");

if (unavPopup && unavTriggers.length > 0) {
    const openPopup = () => {
        unavPopup.classList.add("unav-popup-visible");
        unavPopup.classList.remove("unav-popup-hidden");
        document.body.style.overflow = "hidden";
    };

    const closePopup = () => {
        unavPopup.classList.remove("unav-popup-visible");
        unavPopup.classList.add("unav-popup-hidden");
        document.body.style.overflow = "auto";
    };

    // Make .not-ready feel intentional without the ugly "forbidden" cursor:
    // - add a subtle tooltip via title (only if not already set)
    // - make wrappers keyboard-focusable
    unavTriggers.forEach((el) => {
        if (!el.hasAttribute('title')) el.setAttribute('title', 'Zatím není dostupné');
        if (!el.hasAttribute('aria-disabled')) el.setAttribute('aria-disabled', 'true');
        // If it isn't naturally focusable, allow keyboard users to trigger the popup
        const tag = (el.tagName || '').toLowerCase();
        const naturallyFocusable = ['a','button','input','select','textarea'].includes(tag);
        if (!naturallyFocusable && !el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    });


    unavTriggers.forEach((el) => {
        el.addEventListener("click", (e) => {
            // Pokud klik byl na <a> tag nebo jeho potomka, nechat ho projít (např. Privacy Policy link)
            const clickedLink = e.target.closest('a');
            if (clickedLink) {
                return; // Nechat link fungovat normálně
            }
            e.preventDefault();
            e.stopPropagation();
            if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
            openPopup();
        }, true); // Použít capture phase, aby se spustil dřív než ostatní event listenery
});

    if (unavClose) {
        unavClose.addEventListener("click", closePopup);
    }

    if (unavCloseUnder) {
        unavCloseUnder.addEventListener("click", closePopup);
    }

    unavPopup.addEventListener("click", (e) => {
        if (e.target === unavPopup) {
            closePopup();
        }
    });

    
    // Block form submissions when the form contains any .not-ready element (MVP safety)
    document.addEventListener("submit", (e) => {
        const form = e.target;
        if (form && form.querySelector && form.querySelector(".not-ready")) {
            e.preventDefault();
            e.stopPropagation();
            if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
            openPopup();
        }
    }, true);


    // Keyboard support for .not-ready: Enter / Space opens the popup
    document.addEventListener('keydown', (e) => {
        const active = document.activeElement;
        if (!active || !active.classList || !active.classList.contains('not-ready')) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPopup();
        }
    });
document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closePopup();
        }
    });

}

/* --- SHARE BUTTONS (Gmail / Copy link) --- */

(function () {
    // URL článku – vezme se <link rel="canonical">, jinak aktuální URL
    const canonical = document.querySelector('link[rel="canonical"]');
    const rawUrl = canonical ? canonical.href : window.location.href;

    // Titulek článku – zatím čistě z <title> (OG tagy jsou dočasně pryč)
    const rawTitle = document.title;

    const shareUrl   = encodeURIComponent(rawUrl);
    const shareTitle = encodeURIComponent(rawTitle);

    document.querySelectorAll('.share-fb').forEach(function (el) {
        el.href = 'https://www.facebook.com/sharer/sharer.php?u=' + shareUrl;
    });
    document.querySelectorAll('.share-x').forEach(function (el) {
        el.href = 'https://twitter.com/intent/tweet?url=' + shareUrl + '&text=' + shareTitle;
    });
    document.querySelectorAll('.share-li').forEach(function (el) {
        el.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + shareUrl;
    });

    // E-mail → přímo Gmail compose místo mailto:
    document.querySelectorAll('.share-email').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            const gmailUrl =
                'https://mail.google.com/mail/?view=cm&fs=1&su=' + shareTitle +
                '&body=' + shareUrl;
            window.open(gmailUrl, '_blank', 'noopener,noreferrer');
        });
    });

    // Kopírování odkazu
    document.querySelectorAll('.share-copy').forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(rawUrl)
                    .then(function () {
                        alert('Odkaz na článek byl zkopírován do schránky.');
                    })
                    .catch(function () {
                        alert('Nepodařilo se zkopírovat odkaz.');
                    });
            } else {
                // fallback – starší prohlížeče
                const tempInput = document.createElement('input');
                tempInput.value = rawUrl;
                document.body.appendChild(tempInput);
                tempInput.select();
                try {
                    document.execCommand('copy');
                    alert('Odkaz na článek byl zkopírován do schránky.');
                } catch (e) {
                    alert('Nepodařilo se zkopírovat odkaz.');
                }
                document.body.removeChild(tempInput);
            }
        });
    });
})();

// --- OVLÁDÁNÍ ČLÁNKU ---
(function () {
    const shareButton = document.querySelector('.article-share');
    const bookmarkButton = document.querySelector('.article-bookmark');
    const listenButton = document.querySelector('.article-listen');
    const moreButton = document.querySelector('.article-more');
    const articleKey = 'devblog-bookmark:' + window.location.pathname + window.location.search;

    if (shareButton) {
        shareButton.addEventListener('click', async () => {
            if (navigator.share) {
                try { await navigator.share({ title: document.title, url: window.location.href }); } catch (_) {}
            } else {
                document.querySelector('.sat-mid22')?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    if (bookmarkButton) {
        const refresh = () => {
            const saved = localStorage.getItem(articleKey) === '1';
            bookmarkButton.classList.toggle('is-active', saved);
            bookmarkButton.setAttribute('aria-label', saved ? 'Odebrat článek ze záložek' : 'Uložit článek');
            bookmarkButton.setAttribute('aria-pressed', String(saved));
        };
        refresh();
        bookmarkButton.addEventListener('click', () => {
            if (localStorage.getItem(articleKey) === '1') localStorage.removeItem(articleKey);
            else localStorage.setItem(articleKey, '1');
            refresh();
        });
    }

    if (listenButton && 'speechSynthesis' in window) {
        let speaking = false;
        listenButton.addEventListener('click', () => {
            if (speaking) {
                window.speechSynthesis.cancel();
                speaking = false;
                listenButton.classList.remove('is-active');
                listenButton.setAttribute('aria-label', 'Přehrát článek');
                return;
            }
            const title = document.querySelector('.mainte-top2')?.textContent || '';
            const content = document.getElementById('dbArticleContent')?.textContent || '';
            const utterance = new SpeechSynthesisUtterance((title + '. ' + content).trim());
            utterance.lang = 'cs-CZ';
            utterance.onend = utterance.onerror = () => {
                speaking = false;
                listenButton.classList.remove('is-active');
                listenButton.setAttribute('aria-label', 'Přehrát článek');
            };
            speaking = true;
            listenButton.classList.add('is-active');
            listenButton.setAttribute('aria-label', 'Zastavit přehrávání článku');
            window.speechSynthesis.speak(utterance);
        });
    }

    if (moreButton) moreButton.addEventListener('click', () => {
        (document.getElementById('dbRelatedSection') || document.querySelector('.sat-mid22'))?.scrollIntoView({ behavior: 'smooth' });
    });
})();

// --- PATIČKA: SDÍLENÍ, NÁSTROJE A SOUKROMÍ ---
(function () {
    const pageUrl = encodeURIComponent(window.location.href);
    document.querySelectorAll('.socials-fot').forEach((socials) => {
        const links = socials.querySelectorAll('a');
        const destinations = [
            'https://twitter.com/intent/tweet?url=' + pageUrl,
            'https://www.youtube.com/results?search_query=web+programov%C3%A1n%C3%AD',
            'https://www.linkedin.com/sharing/share-offsite/?url=' + pageUrl,
            'https://www.instagram.com/',
            'https://pinterest.com/pin/create/button/?url=' + pageUrl
        ];
        links.forEach((link, index) => {
            link.href = destinations[index];
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        });
    });

    document.querySelectorAll('.oneotri-fot').forEach((item) => {
        const heading = item.querySelector('.texttobg-fot')?.textContent.trim();
        if (heading === 'Nástroje') {
            item.setAttribute('role', 'link');
            item.tabIndex = 0;
            item.addEventListener('click', () => { window.location.href = '/nastroje/'; });
            item.addEventListener('keydown', (event) => { if (event.key === 'Enter') window.location.href = '/nastroje/'; });
        }
        if (heading === 'Nastavení soukromí') {
            item.setAttribute('role', 'link');
            item.tabIndex = 0;
            item.addEventListener('click', () => { window.location.href = '/privacy-policy/#nastaveni-soukromi'; });
            item.addEventListener('keydown', (event) => { if (event.key === 'Enter') window.location.href = '/privacy-policy/#nastaveni-soukromi'; });
        }
    });
})();

// --- FOOTER YEAR (auto update every year) ---
(function () {
    const year = new Date().getFullYear();
    document.querySelectorAll('.js-year').forEach((el) => {
        el.textContent = year;
    });
})();

// --- KONTAKTNÍ FORMULÁŘ (Web3Forms + mailto fallback) ---
(function () {
    const form = document.getElementById('contactForm');
    if (!form) return; // formulář je pouze na stránce /kontakt/

    // === WEB3FORMS – skutečné odesílání formuláře ===
    // Klíč je nakonfigurován (získán přes https://web3forms.com → "Create Access Key").
    // Pokud budeš chtít klíč někdy změnit, přepiš hodnotu níže.
    // Fallback: kdyby zde byl opět zástupný text VLOZ_SEM_WEB3FORMS_KEY,
    // formulář by se automaticky přepnul na otevření e-mailového programu (mailto).
    const WEB3FORMS_KEY = 'c8d78e40-39f6-46c6-8445-2d9f9e69b3a9';

    // Příjemce – e-mail autora (viz také privacy-policy); používá se pro mailto fallback
    const RECIPIENT = 'jakubryba2020@gmail.com';

    const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
    const PLACEHOLDER = 'VLOZ_SEM_WEB3FORMS_KEY';
    const isKeyConfigured =
        typeof WEB3FORMS_KEY === 'string' &&
        WEB3FORMS_KEY !== PLACEHOLDER &&
        WEB3FORMS_KEY.trim().length > 10;

    const statusEl = document.getElementById('contactStatus');
    const submitBtn = form.querySelector('.ct-submit');

    function setStatus(text) {
        if (statusEl) {
            statusEl.hidden = false;
            statusEl.textContent = text;
        }
    }

    function setButtonState(state) {
        if (!submitBtn) return;
        submitBtn.disabled = state === 'loading';
        submitBtn.textContent =
            state === 'loading' ? 'Odesílám…' : 'Odeslat zprávu';
    }

    function collectData() {
        return {
            name: (document.getElementById('ctName')?.value || '').trim(),
            email: (document.getElementById('ctEmail')?.value || '').trim(),
            subject: (document.getElementById('ctSubject')?.value || '').trim(),
            message: (document.getElementById('ctMessage')?.value || '').trim()
        };
    }

    function isHoneypotFilled() {
        const hp = form.querySelector('[name="botcheck"]');
        return !!(hp && hp.checked);
    }

    function sendViaWeb3Forms(data) {
        return fetch(WEB3FORMS_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                access_key: WEB3FORMS_KEY,
                from_name: 'DevBlog – kontaktní formulář',
                name: data.name,
                email: data.email,
                subject: data.subject
                    ? '[DevBlog] ' + data.subject
                    : '[DevBlog] Dotaz z kontaktního formuláře',
                message: data.message,
                botcheck: isHoneypotFilled()
            })
        }).then(function (res) {
            return res.json().then(function (json) {
                if (!res.ok || !json.success) {
                    throw new Error(json.message || 'Server nepřijal zprávu.');
                }
                return json;
            });
        });
    }

    function sendViaMailto(data) {
        let body = data.message;
        if (data.name) body += '\n\n— ' + data.name;
        if (data.email) body += '\nOdpověď na: ' + data.email;

        window.location.href =
            'mailto:' + RECIPIENT +
            '?subject=' + encodeURIComponent('[DevBlog] Dotaz z kontaktního formuláře') +
            '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Honeypot: roboti vyplní skryté pole → jen předstíráme úspěch
        if (isHoneypotFilled()) {
            setStatus('Děkujeme, zpráva byla odeslána.');
            form.reset();
            return;
        }

        const data = collectData();

        // Fallback: klíč ještě není nastavený → původní chování přes mailto
        if (!isKeyConfigured) {
            sendViaMailto(data);
            setStatus('Děkujeme! Otevřel/a se vám e-mailový program – zprávu stačí odeslat.');
            form.reset();
            return;
        }

        setButtonState('loading');
        setStatus('Odesílám zprávu…');

        sendViaWeb3Forms(data)
            .then(function () {
                setStatus('Děkujeme! Zpráva byla odeslána – ozvu se co nejdříve.');
                form.reset();
            })
            .catch(function () {
                setStatus('Omlouváme se, odeslání se nepovedlo. Zkuste to prosím znovu, ' +
                    'případně mi napište přímo na ' + RECIPIENT + '.');
            })
            .finally(function () {
                setButtonState('idle');
            });
    });
})();
