// tools/generate-static-articles.js
// Generátor statických stránek „falešných“ článků DevBlogu.
// Vychází ze šablony jak-se-naucit-programovat-prakticky-plan-pro-zacatecniky/index.html
// (hlavička + footer se vezmou 1:1, obsah se doplní podle dat níže).
//
// Použití (z kořenu projektu):  node tools/generate-static-articles.js

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATE = path.join(
    ROOT,
    'jak-se-naucit-programovat-prakticky-plan-pro-zacatecniky',
    'index.html'
);

const tpl = fs.readFileSync(TEMPLATE, 'utf8');
const HEAD = tpl.slice(0, tpl.indexOf('<main>'));
const FOOTER = tpl.slice(tpl.indexOf('<footer'));

/* ---------- Stavební bloky obsahu ---------- */

function sec(id, heading, text) {
    return (
        '\n        <div class="textpad-mid2">\n' +
        `            <p class="matit-mid2" id="${id}">${heading}</p>\n\n` +
        `            <p class="notmat-mid2">${text}</p>\n` +
        '        </div>'
    );
}

function listBlock(title, items) {
    const li = items
        .map((t) => `                <li class="onosl-mid2">${t}</li>`)
        .join('\n');
    return (
        '\n        <div class="infote-mid22">\n' +
        `            <p class="ulmt-mid2">${title}</p>\n` +
        '            <ul class="styled-list-mid2">\n' +
        li +
        '\n            </ul>\n        </div>'
    );
}

function midImage(imageClass, caption) {
    return (
        '\n        <div class="textpad-mid2 imgs-mid2">\n' +
        `            <div class="imite-mid2 ${imageClass}"></div>\n` +
        `            <p class="imte-mid2">${caption}</p>\n` +
        '        </div>'
    );
}

function toc(items) {
    const rows = items
        .map(
            (label, i) =>
                `        <a href="#section${i + 1}" class="jtte-stitop2">\n` +
                `            ${label}\n` +
                '            <span class="jtteim-stitop">\n' +
                '                <img class="iardo-stitop" src="/assets/pictures/icon-arrow-down.svg" alt="">\n' +
                '            </span>\n' +
                '        </a>'
        )
        .join('\n');
    return (
        '\n        <div class="mjscen-stitop2">\n' +
        '           <div class="main-jts-stitop2">\n' +
        '    <div class="jts-stitop2">\n' +
        '        <p class="jts-test-stitop2">Přejít na část</p>\n' +
        '    </div>\n' +
        '    <div class="jtscon-stitop2">\n' +
        rows +
        '\n    </div>\n</div>\n\n        </div>'
    );
}

function shareBlock() {
    return `
        <div class="centert-mid2">
            <div class="centertof-mid2"></div>
        </div>
        <div class="textpad-mid2 sat-mid22">
          <p class="sta-text-mid2">Sdílet článek</p>
            <div class="iciwid-mid2 not-ready">
              <a class="icons-mid2 share-fb" target="_blank" rel="noopener noreferrer">
              <img class="imicon-mid222" src="/assets/pictures/icon-facebook.svg" alt="Sdílet na Facebooku">
              </a>
              <a class="icons-mid2 share-x" target="_blank" rel="noopener noreferrer">
              <img class="imicon-mid222" src="/assets/pictures/icon-x-logo.svg" alt="Sdílet na X (Twitter)">
              </a>
              <a class="icons-mid2 share-li" target="_blank" rel="noopener noreferrer">
              <img class="imicon-mid222" src="/assets/pictures/icon-linkedin.svg" alt="Sdílet na LinkedIn">
              </a>
              <a class="icons-mid2 share-email">
              <img class="imicon-mid222" src="/assets/pictures/icon-envelope.svg" alt="Poslat e-mailem">
              </a>
              <button class="icons-mid2 share-copy" type="button">
              <img class="imicon-mid222" src="/assets/pictures/icon-link-chain.svg" alt="Zkopírovat odkaz">
              </button>
            </div>
        </div>`;
}

function relatedBlock() {
    return `
        <header class="textpad-mid2 mid2x">
            <div class="just-con">
                <div class="testx1">
                    <h2>Nejčtenější návody</h2>
                </div>
                <div class="xxx"></div>
            </div>
            <div class="flex-sm-si not-ready">
                <p class="text-sm-styles">Zobrazit více</p>
                <div class="sipka-img">
                    <img src="/assets/pictures/icon-arrow-right.svg" alt="">
                </div>
            </div>
        </header>
        <aside class="right-part ripa-mid22">
      <article class="one-article">
        <div class="img2 im-mid22 image-responsive-web"></div>
        <div class="obsah2 obs-mid22">
<h3 class="main-tittle2mini">Jak navrhnout responzivní layout pomocí CSS Grid</h3>
          <p class="notmain-tittle2">Praktické rozložení, které se přizpůsobí mobilu, tabletu i desktopu.</p>
        </div>
      </article>
      <article class="one-article">
        <div class="img2 im-mid22 image-javascript-code"></div>
        <div class="obsah2 obs-mid22">
<h3 class="main-tittle2mini">Čistý JavaScript: práce s DOM a událostmi</h3>
          <p class="notmain-tittle2">Ovládejte prvky stránky bez frameworku a rozumějte každému kroku.</p>
        </div>
      </article>
      <article class="one-article">
        <div class="img2 im-mid22 image-backend-development"></div>
        <div class="obsah2 obs-mid22">
<h3 class="main-tittle2mini">První REST API v PHP krok za krokem</h3>
          <p class="notmain-tittle2">Načítejte data z databáze a vracejte bezpečnou odpověď ve formátu JSON.</p>
        </div>
      </article>
    </aside>

        <!-- konec levé strany  ! ! ! ! ! ! ! ! ! ! !-->
        </div>`;
}

function newsletterBlock() {
    return `
        <div class="right-part-top2"><!-- newsletter -->
            <form class="mainnewsl-top2">
              <div class="primartext-up-top2">
                <h3 class="get-your-top2">Novinky ze světa programování</h3>
                <p class="newsl-mintext-top2">Dostávejte nové návody k HTML, CSS, JavaScriptu, PHP a databázím přímo do e-mailu.</p>
              </div>
              <div class="newsl-interct-top2 not-ready">
                <input class="inoputemail-top2" type="email" autocomplete="email" aria-label="E-mail pro odběr newsletteru" placeholder="Zadejte svůj e-mail…">
                <button class="signupbtn-top2" type="submit">Přihlásit se</button>
              </div>
            </form>
        </div>
    </div>
</div>
</main>

`;
}

function buildPage(a) {
    const header = `
<main>
<div class="matwo-devblog-top2">
    <div class="problem">
        <div class="left-part-top2"><!-- obsah -->
            <div class="mtodevblog-top2">
                <h1 class="mainte-top2">${a.title}</h1>
                <div class="inumt-con-top2">
                    <div class="metinf-top2">
                        <p class="tecaada-top2">Publikováno <span class="spantext-top2">(${a.date})</span></p>
                    </div>
                    <div class="inbts-top2 not-ready">
                        <button class="jubtn-top" type="button" aria-label="Sdílet článek">
                            <img class="juimg-top" src="/assets/pictures/share-icon.svg" alt="">
                        </button>
                        <button class="jubtn-top" type="button" aria-label="Uložit článek">
                            <img class="juimg-top" src="/assets/pictures/icon-bookmark.svg" alt="">
                        </button>
                        <button class="jubtn-top" type="button" aria-label="Přehrát článek">
                            <img class="juimg-top" src="/assets/pictures/icon-play-circle.svg" alt="">
                        </button>
                        <button class="jubtn-top" type="button" aria-label="Další možnosti">
                            <img class="juimg-top" src="/assets/pictures/icon-ellipsis-more.svg" alt="">
                        </button>
                    </div>
                </div>
                <div class="img-ligre-top ${a.hero}"></div>
            </div>`;

    const intro =
        '\n        <div class="centert-mid2">\n' +
        '            <div class="centertof-mid2"></div>\n' +
        '        </div>\n' +
        '        <div class="textpad-mid2">\n' +
        `            <p class="infote-mid2">${a.intro}</p>\n` +
        a.sections
            .map((s, i) => sec('section' + (i + 1), (i + 1) + ' — ' + s.h, s.t))
            .join('\n') +
        '\n        </div>';

    const extra =
        (a.list ? listBlock(a.list.title, a.list.items) : '') +
        (a.midImage ? midImage(a.midImage.cls, a.midImage.caption) : '');

    const page =
        HEAD.replace(/<title>[\s\S]*?<\/title>/, `<title>${a.title} | DevBlog</title>`) +
        header +
        toc(a.sections.map((s) => s.toc)) +
        intro +
        extra +
        shareBlock() +
        relatedBlock() +
        newsletterBlock() +
        FOOTER;

    return page;
}

const ARTICLES = [
    {
        dir: 'javascript-od-zakladu-promenne-funkce-a-dom',
        title: 'JavaScript od základů: proměnné, funkce a DOM',
        date: '14. dubna 2026',
        hero: 'image-javascript-code',
        intro: 'JavaScript je jazyk, který dodává webovým stránkám život. Bez něj zůstane stránka jen statickým dokumentem — s ním reaguje na uživatele, mění obsah a komunikuje se serverem.<br><br>V tomto článku si projdeme tři pilíře, které potřebujete na začátek: proměnné, funkce a práci s DOM. Nejde o teorii naznak — u každého konceptu si ukážeme, k čemu je v reálné stránce dobrý.<br><br>Stačí prohlížeč, editor a ochota experimentovat.',
        sections: [
            {
                toc: 'Proměnné a datové typy',
                h: 'Proměnné a datové typy',
                t: 'Proměnná je pojmenované úložiště pro hodnotu, které se může během programu měnit. V moderním JavaScriptu se deklaruje pomocí let (hodnota se bude měnit) nebo const (hodnota zůstává stejná).<br><br>Seznamte se postupně se základními typy: číslo, řetězec, logická hodnota, pole a objekt. Pole uchovává seznam hodnot, objekt popisuje jednu věc pomocí vlastností.<br><br>Nedělejte si hlavu s exotickými detaily typového systému. Na začátek stačí vědět, jak hodnotu uložit, přečíst a zkontrolovat pomocí console.log.'
            },
            {
                toc: 'Funkce a opakování kódu',
                h: 'Funkce a opakování kódu',
                t: 'Funkce je pojmenovaný blok kódu, který můžete spustit kolikrát chcete. Přijímá vstupy (parametry) a vrací výsledek pomocí return.<br><br>Díky funkcím se kód dělí na malé srozumitelné celky. Když vidíte funkci s názvem validateEmail, hned víte, co dělá — a když potřebujete chování upravit, měníte ji jen na jednom místě.<br><br>Cvičení: napište funkci, která přijme seznam čísel a vrátí jejich průměr. Pak ji použijte na reálných datech ze své stránky.'
            },
            {
                toc: 'Práce s DOM',
                h: 'Práce s DOM',
                t: 'DOM je objektová reprezentace stránky, se kterou JavaScript pracuje. Prvkům na stránce můžete měnit text, styly, třídy i strukturu.<br><br>Základem je výběr prvku pomocí document.querySelector a následná změna vlastnosti, například textContent nebo classList.<br><br>Zkuste vytvořit tlačítko, které po kliknutí přepíše nadpis stránky, a pak seznam, do kterého JavaScript postupně přidá položky z pole. Přesně tohle je jádro veškeré práce s DOM.'
            },
            {
                toc: 'Události a interaktivita',
                h: 'Události a interaktivita',
                t: 'Události propojují všechno předchozí dohromady. Pomocí addEventListener říkáte: když nastane kliknutí, stisk klávesy nebo odeslání formuláře, spusť tuto funkci.<br><br>Typický řetězec vypadá takto: vyberete prvek, zaregistrujete posluchače události a v obsluze přečtete data od uživatele a upravíte stránku.<br><br>Když těmto čtyřem krokům porozumíte, dokážete postavit formulář s validací, filtrovací pole nebo interaktivní seznam úkolů — vše bez jediné knihovny.'
            }
        ],
        midImage: {
            cls: 'image-javascript-code',
            caption: 'Od proměnných k interaktivní stránce — základní pilíře JavaScriptu'
        }
    },
    {
        dir: 'git-a-github-bez-stresu-prvni-verzovani-projektu',
        title: 'Git a GitHub bez stresu: první verzování projektu',
        date: '6. května 2026',
        hero: 'image-git-github',
        intro: 'Ztratili jste někdy funkční verzi projektu, protože jste ji přepsali? Přesně proto existuje verzovací systém. Git ukládá historii všech změn a umožňuje se kdykoli vrátit zpět.<br><br>GitHub ho doplňuje o online úložiště, kde může projekt sdílet, zálohovat a ukazovat v portfoliu.<br><br>V tomto článku si projdeme první verzování projektu krok za krokem — od instalace po první nahrání na GitHub.',
        sections: [
            {
                toc: 'Proč verzovat kód',
                h: 'Proč verzovat kód',
                t: 'Bez verzování vznikají soubory typu final, final2 a final-opravdu-final. Git tento chaos řeší: každá uložená změna (commit) má čas, autora a popis.<br><br>Historii si můžete prohlédnout, porovnat verze nebo se vrátit k poslednímu funkčnímu stavu. Když něco rozbijete, nic se skutečně neztratí.<br><br>Verzování navíc buduje dobrý pracovní návyk: malé kroky, jasné popisy a kontrola nad tím, co a kdy se změnilo.'
            },
            {
                toc: 'První repozitář a commity',
                h: 'První repozitář a commity',
                t: 'Repozitář založíte příkazem git init ve složce projektu. Soubory pak přidáváte pomocí git add a ukládáte příkazem git commit s popisnou zprávou.<br><br>Zásada zní: jeden commit = jedna logická změna. Přidání stylů a oprava chyby patří do dvou různých commitů.<br><br>Do repozitáře nepatří vygenerované soubory ani hesla. Pro výjimky slouží soubor .gitignore, který Git při ukládání ignoruje.'
            },
            {
                toc: 'Větve a bezpečné experimentování',
                h: 'Větve a bezpečné experimentování',
                t: 'Větev je samostatná linka vývoje. Na hlavní větvi zůstává stabilní verze projektu a nové nápady vyvíjíte ve vlastní větvi, kterou po otestování sloučíte zpět.<br><br>Díky tomu můžete experimentovat bez strachu — hlavní větev se nemění, dokud nová funkce není hotová a vyzkoušená.<br><br>Na začátek stačí tři příkazy: git branch pro vytvoření, git checkout pro přepnutí a git merge pro sloučení. Zbytek přijde s praxí.'
            },
            {
                toc: 'GitHub a sdílení projektu',
                h: 'GitHub a sdílení projektu',
                t: 'Repozitář na GitHubu propojíte pomocí git remote add a nahrajete příkazem git push. Od té chvíle máte kód zálohovaný online a dostupný odkazem.<br><br>Veřejný repozitář je nejlepší vizitka vývojáře. K projektu přidejte soubor README s krátkým popisem, postupem spuštění a ukázkou výsledku.<br><br>Nebojte se ukazovat i menší projekty — ukazují, že dokážete práci dotáhnout do konce.'
            }
        ],
        list: {
            title: '4 výhody verzovacího systému Git',
            items: [
                'Přehledná historie všech změn v kódu',
                'Bezpečné experimentování v samostatných větvích',
                'Záloha projektu online přes GitHub',
                'Veřejné projekty použitelné v portfoliu'
            ]
        },
        midImage: {
            cls: 'image-git-github',
            caption: 'Každý commit je bezpečný bod, ke kterému se můžete vrátit'
        }
    },
    {
        dir: 'html-a-css-pevne-zaklady-moderniho-webu',
        title: 'HTML a CSS: pevné základy moderního webu',
        date: '10. února 2026',
        hero: 'image-responsive-web',
        intro: 'Každá webová stránka stojí na dvou technologiích: HTML dává obsahu strukturu a CSS určuje, jak bude vypadat. Bez jejich pochopení se později ztratíte v každém frameworku.<br><br>Dobrá zpráva je, že základy zvládnete rychle. Stačí pochopit pár principů a hlavně si je hned vyzkoušet ve vlastní stránce.<br><br>V tomto článku si projdeme, jak postavit přehlednou strukturu stránky a přizpůsobit ji mobilu i počítači.',
        sections: [
            {
                toc: 'Struktura stránky v HTML',
                h: 'Struktura stránky v HTML',
                t: 'HTML popisuje význam obsahu. Hlavička stránky patří do header, navigace do nav, hlavní obsah do main a části obsahu do section a article.<br><br>Sémantické prvky nejsou jen o úhlednosti. Pomáhají vyhledávačům, čtečkám pro zrakově postižené i vám samotným při orientaci v kódu.<br><br>Cvičení: napište stránku o sobě s hlavičkou, odstavci, seznamem a obrázkem — a to jen pomocí sémantických značek, bez jediné třídy.'
            },
            {
                toc: 'Stylování pomocí CSS',
                h: 'Stylování pomocí CSS',
                t: 'CSS vybírá prvky pomocí selektorů a nastavuje jim vlastnosti — barvy, velikosti, mezery i rozložení. Základní jednotkou je pravidlo: selektor a složené závorky s vlastnostmi.<br><br>Nejdůležitější pojmy na začátek jsou kaskáda (které pravidlo vyhrává), dědičnost a box model — tedy to, jak se k šířce prvku počítají odsazení a okraje.<br><br>Pro rozložení stránky se dnes používá Flexbox pro jednorozměrné řady a CSS Grid pro mřížky. Oba zvládnete na pár malých příkladech.'
            },
            {
                toc: 'Responzivní design',
                h: 'Responzivní design',
                t: 'Responzivní stránka se přizpůsobí obrazovce — od mobilu po velký monitor. Základem je meta značka viewport a jednotky, které se umí počítat s dostupným místem.<br><br>Pomocí media queries měníte rozložení podle šířky obrazovky: na mobilu stojí prvky pod sebou, na desktopu vedle sebe.<br><br>Pravidlo, které se vyplácí dodržovat: navrhujte nejprve pro mobil a teprve pak přidávejte úpravy pro větší obrazovky. Ušetří vám to spoustu přepisování.'
            },
            {
                toc: 'Osvědčené postupy',
                h: 'Osvědčené postupy',
                t: 'Pojmenovávejte třídy podle významu, ne podle vzhledu. Třída article-card vydrží, i když změníte design; modry-nadpis ne.<br><br>Oddělujte strukturu od vzhledu: HTML nese obsah, CSS stylování a JavaScript chování. Toto pravidlo vám ušetří hodiny hledání, kde se co změnilo.<br><br>Stránku pravidelně zkoušejte v prohlížeči, ideálně i v mobilním rozlišení. Chyby v layoutu se nejsnáze opravují hned, jak vzniknou.'
            }
        ],
        midImage: {
            cls: 'image-responsive-web',
            caption: 'Stejný obsah, jiné rozložení — o tohle jde v responzivním designu'
        }
    },
    {
        dir: 'javascript-v-praxi-interaktivni-web-krok-za-krokem',
        title: 'JavaScript v praxi: interaktivní web krok za krokem',
        date: '2. června 2026',
        hero: 'image-javascript-code',
        intro: 'Znát syntaxi je jedno. Druhé je umět z ní postavit něco, co funguje. V tomto článku si proto projdeme cestu od prázdné stránky k jednoduché interaktivní aplikaci — krok za krokem.<br><br>Nebudeme používat žádný framework. Všechno uděláme v čistém JavaScriptu, abyste rozuměli každému řádku.<br><br>Jako příklad poslouží seznam úkolů: zadáte text, přidá se do seznamu, dá se odškrtnout a smazat. Malá aplikace, která obsahuje všechno podstatné.',
        sections: [
            {
                toc: 'Plán než první řádek kódu',
                h: 'Plán než první řádek kódu',
                t: 'Nejdřív si rozepište, co má aplikace umět: zobrazit seznam, přidat položku, odškrtnout ji a smazat. Čtyři funkce — čtyři malé úkoly.<br><br>Pak si připravte HTML strukturu: formulář s textovým polem, tlačítkem a prázdným seznamem, do kterého bude JavaScript vkládat položky.<br><br>Rozdělení práce na malé kroky je dovednost, která odlišuje začátečníky od pokročilých. Nejde o to napsat všechno najednou, ale ve správném pořadí.'
            },
            {
                toc: 'Výběr a úprava prvků',
                h: 'Výběr a úprava prvků',
                t: 'Prvky stránky si JavaScript „vyzvedne“ pomocí document.querySelector nebo getElementById. Uložte si je do proměnných hned na začátku skriptu.<br><br>Obsah položek přidáváte bezpečně přes createElement a textContent — nikdy přes innerHTML s daty od uživatele. Zabráníte tak potížím s XSS.<br><br>Novou položku seznamu vytvoříte tak, že sestavíte prvek li, naplníte ho textem z inputu a připojíte pomocí appendChild.'
            },
            {
                toc: 'Reakce na uživatele',
                h: 'Reakce na uživatele',
                t: 'Odeslání formuláře zachytíte událostí submit. Nezapomeňte zavolat preventDefault, jinak se stránka znovu načte a stav aplikace zmizí.<br><br>Odškrtávání a mazání vyřešíte jedním posluchačem na rodičovském seznamu: podle kliknutého tlačítka upravíte třídu nebo prvek odstraníte.<br><br>Tento vzorec — jeden posluchač pro celý seznam místo desítek samostatných — se jmenuje delegování událostí a používá se všude.'
            },
            {
                toc: 'Ladění a vylepšování',
                h: 'Ladění a vylepšování',
                t: 'Nástroje pro vývojáře v prohlížeči jsou váš nejlepší kamarád. V konzoli uvidíte chyby, v panelu Elements zkontrolujete strukturu a v Sources můžete kód krokovat.<br><br>Když něco nefunguje, zmenšete problém: vypisujte si mezivýsledky pomocí console.log a zjistěte, kde přesně data ztrácejí očekávanou hodnotu.<br><br>Až základní verzi dokončíte, přidejte ukládání do localStorage — seznam přežije obnovení stránky a vy se přitom naučíte pracovat s daty, která zůstávají.'
            }
        ],
        midImage: {
            cls: 'image-javascript-code',
            caption: 'Malá aplikace postavená čistě na DOM a událostech'
        }
    },
    {
        dir: 'git-a-github-bezpecne-verzovani-projektu',
        title: 'Git a GitHub: bezpečné verzování projektů',
        date: '20. května 2026',
        hero: 'image-git-github',
        intro: 'Verzování zní jako téma pro velké týmy, ale ve skutečnosti ho potřebujete hned, jakmile píšete druhou verzi svého kódu. Git je pojistka, díky které nikdy nepřijdete o práci.<br><br>V tomto článku si projdeme bezpečný pracovní cyklus: jak měnit kód tak, aby se vždy dalo vrátit zpět, a jak projekt zálohovat na GitHub.<br><br>Cílem není znát všech sto příkazů, ale rozumět těm pěti, které používáte každý den.',
        sections: [
            {
                toc: 'Základní pracovní cyklus',
                h: 'Základní pracovní cyklus',
                t: 'Práce s Gitem se točí kolem cyklu: upravíte soubory, zkontrolujete změny přes git status, přidáte je pomocí git add a uložíte přes git commit.<br><br>Commit je snímek projektu v konkrétní chvíli. Zprávou k němu popište, proč změnu děláte — za měsíc vám poděkuje i vaše vlastní paměť.<br><br>Stav repozitáře kdykoli zkontrolujete příkazem git log, který vypíše celou historii commitů.'
            },
            {
                toc: 'Historie a vracení změn',
                h: 'Historie a vracení změn',
                t: 'Největší silou Gitu je možnost vzít si zpět. Rozbitou změnu můžete vrátit novým commitem přes git revert — a historie zůstane zachovaná a upřímná.<br><br>Neuložené změny v jednom souboru zahodíte pomocí git restore, rozpracovanou práci můžete dočasně odložit pomocí git stash.<br><br>Zlaté pravidlo: než začnete něco riskantního, udělejte commit. Pak se vám nic nemůže pokazit natrvalo.'
            },
            {
                toc: 'Vzdálený repozitář',
                h: 'Vzdálený repozitář',
                t: 'Lokální repozitář je jen na vašem počítači. Až ho propojíte s GitHubem pomocí git remote, můžete změny nahrávat přes git push a stahovat přes git pull.<br><br>Pull dělejte na začátku práce, push na konci — ať pracujete vždy s aktuálním stavem projektu.<br><br>GitHub navíc nabízí soukromé repozitáře zdarma, takže i školní nebo osobní projekt můžete zálohovat, aniž by byl veřejný.'
            },
            {
                toc: 'Dobrá commit zpráva',
                h: 'Dobrá commit zpráva',
                t: 'Dobrá zpráva je krátká a popisná: „Oprava výpočtu součtu v košíku“ místo „úpravy“. Píše se v rozkazovacím tvaru a vysvětluje proč, ne jen co.<br><br>Pokud opravujete chybu, zmíňte, jak se projevovala. Pokud přidáváte funkci, řekněte, co nově umí uživatel dělat.<br><br>Kvalita commit zpráv je to, co odliší repozitář, který chcete ukázat v portfoliu, od nepřehledné hromady změn.'
            }
        ],
        list: {
            title: '5 příkazů, které pokrývají většinu práce',
            items: [
                'git status — co se právě mění',
                'git add — připravit změny k uložení',
                'git commit — uložit snímek s popisem',
                'git push — nahrát změny na GitHub',
                'git pull — stáhnout aktuální stav z GitHubu'
            ]
        },
        midImage: {
            cls: 'image-git-github',
            caption: 'Bezpečný cyklus: změna, commit, push'
        }
    },
    {
        dir: 'php-a-mysql-propojeni-formulare-s-databazi',
        title: 'PHP a MySQL: propojení formuláře s databází',
        date: '15. července 2026',
        hero: 'image-backend-development',
        intro: 'Formulář, který data jen vypíše, je jen půlka práce. Skutečná aplikace je uloží, bezpečně zpracuje a později z nich znovu načte. Přesně tohle vás naučí spojení PHP a MySQL.<br><br>V tomto článku si postavíme typický backend scénář: formulář na straně klienta, zpracování v PHP a uložení do databáze — vše s důrazem na bezpečnost.<br><br>Budete potřebovat lokální server s PHP a MySQL, například XAMPP, nebo hosting jako Alwaysdata.',
        sections: [
            {
                toc: 'Formulář a jeho zpracování',
                h: 'Formulář a jeho zpracování',
                t: 'HTML formulář odešle data metodou POST na PHP skript, který je přečte z pole $_POST. Vždy ověřte, že formulář byl skutečně odeslán, a zkontrolujte přítomnost hodnot.<br><br>Data od uživatele nikdy nevěřte. Očistěte mezery pomocí trim, zkontrolujte délku a formát a prázdné či nesmyslné hodnoty odmítněte s jasnou hláškou.<br><br>Základem je validace na serveru. JavaScriptová validace je jen příjemné vylepšení, ne ochrana.'
            },
            {
                toc: 'Připojení k databázi přes PDO',
                h: 'Připojení k databázi přes PDO',
                t: 'Pro práci s databází v PHP použijte rozhraní PDO. Připojení vytvoříte pomocí DSN řetězce s adresou serveru, názvem databáze a kódováním utf8mb4.<br><br>Přihlašovací údaje k databázi nikdy nezapisujte přímo do kódu, který je na gitu. Uložte je do samostatného config souboru, který je v .gitignore.<br><br>Zapněte výjimky (PDO::ERRMODE_EXCEPTION), ať se o chybách dozvíte hned a srozumitelně.'
            },
            {
                toc: 'Ukládání dat bezpečně',
                h: 'Ukládání dat bezpečně',
                t: 'Dotazy s daty od uživatele vždy píšte jako prepared statements. Zástupné znaky ? a funkce execute zajistí, že data se nikdy neprovedou jako součást SQL příkazu.<br><br>Tímto jedním zvykem se chráníte proti SQL injection — nejrozšířenějšímu útoku na webové aplikace.<br><br>Vložení záznamu zkontrolujte a uživatele informujte o výsledku. Když se uložení nepovede, vypište obecnou chybu — detaily patří do logu, ne na obrazovku.'
            },
            {
                toc: 'Výpis a další kroky',
                h: 'Výpis a další kroky',
                t: 'Data z databáze čtete přes fetch nebo fetchAll a při výpisu je vždy escapujte pomocí htmlspecialchars — jinak jste otevření útoku XSS.<br><br>Přidejte seznam uložených položek pod formulář a máte hotový celý cyklus: uložit, načíst, zobrazit.<br><br>Jako další krok zkuste mazání záznamů — a jen přes POST s potvrzením. Pak přidejte přihlašování a máte základ každé administrace.'
            }
        ],
        list: {
            title: 'Bezpečnostní pravidla, na která nesmíte zapomenout',
            items: [
                'Validujte všechna data na serveru',
                'Používejte výhradně prepared statements',
                'Escapujte výstup přes htmlspecialchars',
                'Přihlašovací údaje držte mimo repozitář',
                'Chyby logujte, uživateli vypisujte jen obecné hlášky'
            ]
        },
        midImage: {
            cls: 'image-backend-development',
            caption: 'Formulář → PHP → databáze → zpět na stránku'
        }
    }
];

// ---------- Generování ----------

ARTICLES.forEach((a) => {
    const dir = path.join(ROOT, a.dir);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'index.html');
    fs.writeFileSync(file, buildPage(a), 'utf8');
    console.log('Vytvořeno: ' + path.relative(ROOT, file));
});

console.log('Hotovo — vygenerováno ' + ARTICLES.length + ' stránek.');



