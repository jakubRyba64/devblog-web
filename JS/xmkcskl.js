// --- MOBILE MENU TOGGLE ---

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
    // základní návrhy – můžeš rozšířit / změnit
    const SEARCH_SUGGESTIONS = [
        "programování",
        "HTML",
        "CSS",
        "JavaScript",
        "PHP",
        "databáze"
    ];

    const createResultItem = (text) => {
        const li = document.createElement("li");

        const label = document.createElement("span");
        label.textContent = text;

        const icon = document.createElement("img");
        icon.src = "/assets/pictures/icon-search.svg";
        icon.alt = "Hledat";

        li.appendChild(label);
        li.appendChild(icon);

        li.addEventListener("click", () => {
            navSearchInput.value = text;
            navSearchResults.classList.remove("show");
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

        const filtered = SEARCH_SUGGESTIONS.filter((item) =>
            item.toLowerCase().includes(trimmed)
        );

        if (filtered.length === 0) {
            navSearchResults.classList.remove("show");
            return;
        }

        filtered.forEach((text) => {
            navSearchResults.appendChild(createResultItem(text));
        });

        navSearchResults.classList.add("show");
    };

    navSearchInput.addEventListener("input", (e) => {
        updateResults(e.target.value);
    });

    navSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            navSearchResults.classList.remove("show");
            navSearchInput.blur();
        }
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
            // Pokud má tlačítko třídu .not-ready, nechat to na popup handleru
            if (mobileSearchBtn.classList.contains("not-ready")) {
                return; // Nechat event probublat k popup handleru
            }
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
