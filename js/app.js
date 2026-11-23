/**
 * ==========================================================================
 * app.js
 * Alpine.js による全体状態管理（カード開閉 / スクロール監視 /
 * キーボードショートカット / Vim風ステータスバー表示）を統括。
 * ==========================================================================
 */

function createPaginatedList({ fetcher, toHaystack, perPage = 8 }) {
    return () => ({
        items: [],
        query: '',
        page: 1,
        perPage,
        loading: true,
        error: false,

        async init() {
            this.$watch('query', () => {
                this.page = 1;
            });
            await this.load();
        },

        async load() {
            this.loading = true;
            this.error = false;
            try {
                this.items = await fetcher();
            } catch {
                this.error = true;
            } finally {
                this.loading = false;
            }
        },

        get filtered() {
            const keywords = this.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
            if (keywords.length === 0) return this.items;

            return this.items.filter((item) => {
                const haystack = toHaystack(item)
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                return keywords.every((kw) => haystack.includes(kw));
            });
        },

        get totalPages() {
            return Math.max(1, Math.ceil(this.filtered.length / this.perPage));
        },

        get paginated() {
            const safePage = Math.min(this.page, this.totalPages);
            const start = (safePage - 1) * this.perPage;
            return this.filtered.slice(start, start + this.perPage);
        },

        scrollToTop() {
            document.querySelector('.main-panel')?.scrollTo({ top: 0, behavior: 'smooth' });
        },

        prevPage() {
            if (this.page > 1) {
                this.page -= 1;
                this.scrollToTop();
            }
        },

        nextPage() {
            if (this.page < this.totalPages) {
                this.page += 1;
                this.scrollToTop();
            }
        },
    });
}

document.addEventListener('alpine:init', () => {
    Alpine.data('paletteCard', () => ({
        colors: window.NordPalette?.colors || [],
        copiedName: '',
        copiedText: '',
        timerId: null,

        async copyColor(color) {
            if (!window.NordPalette) return;
            try {
                await window.NordPalette.copy(color.hex);
                this.copiedName = color.name;
                this.copiedText = `copied: ${color.hex}`;
                clearTimeout(this.timerId);
                this.timerId = setTimeout(() => {
                    this.copiedName = '';
                    this.copiedText = '';
                }, 1500);
            } catch {
                this.copiedName = '';
                this.copiedText = 'copy failed';
            }
        },
    }));

    Alpine.data('productsPage', createPaginatedList({
        fetcher: () => window.PortfolioAPI.fetchGithubRepos(),
        toHaystack: (repo) => [repo.name, repo.description, repo.language],
    }));

    Alpine.data('articlesPage', createPaginatedList({
        fetcher: () => window.PortfolioAPI.fetchQiitaArticles(),
        toHaystack: (article) => [article.title, ...article.tags, article.date],
    }));

    Alpine.data('homePage', () => ({
        recentProducts: [],
        recentArticles: [],
        loadingProducts: true,
        loadingArticles: true,
        errorProducts: false,
        errorArticles: false,

        async init() {
            const [productsResult, articlesResult] = await Promise.allSettled([
                window.PortfolioAPI.fetchGithubRepos(),
                window.PortfolioAPI.fetchQiitaArticles(),
            ]);

            if (productsResult.status === 'fulfilled') {
                this.recentProducts = productsResult.value.slice(0, 2);
            } else {
                this.errorProducts = true;
            }
            this.loadingProducts = false;

            if (articlesResult.status === 'fulfilled') {
                this.recentArticles = articlesResult.value.slice(0, 2);
            } else {
                this.errorArticles = true;
            }
            this.loadingArticles = false;
        },
    }));
});

/**
 * サイト内ページ遷移（軽量 PJAX）
 * 外枠（ヘッダ・左右サイドバー・パレット・ステータスバー）を保持したまま
 * main-panel の中身だけを差し替える。file:// 直開き時や取得失敗時は通常遷移へフォールバック。
 */
(() => {
    const LEAVE_DURATION_MS = 240;
    let navigationId = 0;

    function wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function updateActiveNav(pathname) {
        const current = pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.dir-tree-card a').forEach((a) => {
            if (a.getAttribute('href')?.endsWith(current)) {
                a.setAttribute('aria-current', 'page');
            } else {
                a.removeAttribute('aria-current');
            }
        });
    }

    function swapMainPanel(mainPanel, nextHtml) {
        const existingCopyright = mainPanel.querySelector('.copyright');
        const copyrightText = existingCopyright?.textContent || '© 2026 norder';

        const applyDom = () => {
            if (window.Alpine?.destroyTree) {
                Array.from(mainPanel.children).forEach((child) => {
                    window.Alpine.destroyTree(child);
                });
            }

            mainPanel.innerHTML = `${nextHtml}<hr>`;
            const copyright = document.createElement('p');
            copyright.className = 'copyright';
            copyright.textContent = copyrightText;
            mainPanel.appendChild(copyright);

            if (window.lucide) {
                window.lucide.createIcons();
            }
        };

        if (window.Alpine?.mutateDom) {
            window.Alpine.mutateDom(applyDom);
            Array.from(mainPanel.children).forEach((child) => {
                window.Alpine.initTree?.(child);
            });
        } else {
            applyDom();
        }
    }

    async function fetchPageContent(url) {
        const response = await fetch(url, {
            headers: { 'X-Requested-With': 'pjax' },
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const html = await response.text();
        const nextDoc = new DOMParser().parseFromString(html, 'text/html');
        const nextLayout = nextDoc.querySelector('portfolio-layout');
        if (!nextLayout) {
            throw new Error('portfolio-layout not found');
        }
        return {
            title: nextDoc.title,
            html: nextLayout.innerHTML,
        };
    }

    async function navigateTo(destination, { pushHistory = true } = {}) {
        const mainPanel = document.querySelector('.main-panel');
        if (!mainPanel) {
            window.location.href = destination.href;
            return;
        }

        const currentNavId = ++navigationId;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const leaveDelay = reducedMotion ? 0 : LEAVE_DURATION_MS;

        // file:// 環境では fetch が CORS 制限されるため通常遷移にフォールバック
        if (location.protocol === 'file:') {
            if (leaveDelay > 0) {
                mainPanel.classList.add('is-leaving');
                await wait(leaveDelay);
            }
            window.location.href = destination.href;
            return;
        }

        if (leaveDelay > 0) {
            mainPanel.classList.add('is-leaving');
        }

        try {
            const [page] = await Promise.all([
                fetchPageContent(destination.href),
                leaveDelay > 0 ? wait(leaveDelay) : Promise.resolve(),
            ]);

            if (currentNavId !== navigationId) return;

            if (pushHistory) {
                history.pushState({ url: destination.href }, '', destination.href);
            }
            if (page.title) {
                document.title = page.title;
            }

            swapMainPanel(mainPanel, page.html);
            updateActiveNav(destination.pathname);

            if (destination.hash) {
                const target = document.getElementById(destination.hash.slice(1));
                if (target) {
                    target.scrollIntoView();
                } else {
                    mainPanel.scrollTop = 0;
                }
            } else {
                mainPanel.scrollTop = 0;
            }

            // is-leaving を外して panel-enter アニメーションを再生
            void mainPanel.offsetWidth;
            mainPanel.classList.remove('is-leaving');
        } catch {
            if (currentNavId !== navigationId) return;
            window.location.href = destination.href;
        }
    }

    window.addEventListener('pageshow', () => {
        document.querySelector('.main-panel')?.classList.remove('is-leaving');
    });

    window.addEventListener('popstate', () => {
        navigateTo(new URL(location.href), { pushHistory: false });
    });

    document.addEventListener('click', (event) => {
        if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
        ) {
            return;
        }

        const link = event.target.closest('a[href]');
        if (!link) return;

        const rawHref = link.getAttribute('href');
        if (
            !rawHref ||
            rawHref.startsWith('#') ||
            rawHref.startsWith('mailto:') ||
            rawHref.startsWith('tel:') ||
            rawHref.startsWith('javascript:') ||
            link.hasAttribute('download') ||
            (link.target && link.target !== '_self')
        ) {
            return;
        }

        let destination;
        try {
            destination = new URL(rawHref, location.href);
        } catch {
            return;
        }

        const isSameSite =
            destination.protocol === location.protocol &&
            destination.origin === location.origin;

        if (!isSameSite || destination.href === location.href) {
            return;
        }

        event.preventDefault();
        navigateTo(destination, { pushHistory: true });
    });

    /**
     * Vim 風キーボードショートカット
     * - 1-4 : ページ移動（index / profile / products / articles）
     * - j/k : main-panel の上下スクロール
     * - gg  : main-panel の最上部へ移動
     * - G   : main-panel の最下部へ移動
     */
    const PAGE_SHORTCUTS = {
        '1': './index.html',
        '2': './profile.html',
        '3': './products.html',
        '4': './articles.html',
    };
    const SCROLL_STEP_PX = 120;
    const GG_TIMEOUT_MS = 500;

    let pendingG = false;
    let pendingGTimer = null;

    function resetPendingG() {
        pendingG = false;
        clearTimeout(pendingGTimer);
        pendingGTimer = null;
    }

    function isEditableTarget(target) {
        if (!(target instanceof Element)) return false;
        return Boolean(target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]'));
    }

    document.addEventListener('keydown', (event) => {
        if (event.defaultPrevented || event.isComposing) return;
        if (event.ctrlKey || event.metaKey || event.altKey) return;

        // 入力欄フォーカス中は誤爆を防ぎ、Escape でのフォーカス解除のみ許可
        if (isEditableTarget(event.target)) {
            if (event.key === 'Escape') {
                event.target.blur();
            }
            resetPendingG();
            return;
        }

        const key = event.key;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const smoothBehavior = reducedMotion ? 'auto' : 'smooth';

        // 1-4: ページジャンプ
        if (PAGE_SHORTCUTS[key]) {
            resetPendingG();
            const destination = new URL(PAGE_SHORTCUTS[key], location.href);
            const currentFile = location.pathname.split('/').pop() || 'index.html';
            const nextFile = destination.pathname.split('/').pop() || 'index.html';
            if (nextFile !== currentFile) {
                event.preventDefault();
                navigateTo(destination, { pushHistory: true });
            }
            return;
        }

        const mainPanel = document.querySelector('.main-panel');
        if (!mainPanel) return;

        // gg: 最上部へ
        if (key === 'g') {
            event.preventDefault();
            if (pendingG) {
                resetPendingG();
                mainPanel.scrollTo({ top: 0, behavior: smoothBehavior });
            } else {
                pendingG = true;
                clearTimeout(pendingGTimer);
                pendingGTimer = setTimeout(resetPendingG, GG_TIMEOUT_MS);
            }
            return;
        }

        resetPendingG();

        // G: 最下部へ
        if (key === 'G') {
            event.preventDefault();
            mainPanel.scrollTo({ top: mainPanel.scrollHeight, behavior: smoothBehavior });
            return;
        }

        // j / k: 上下スクロール（押しっぱなし時は途切れないよう auto）
        if (key === 'j' || key === 'k') {
            event.preventDefault();
            const delta = key === 'j' ? SCROLL_STEP_PX : -SCROLL_STEP_PX;
            mainPanel.scrollBy({
                top: delta,
                behavior: event.repeat || reducedMotion ? 'auto' : 'smooth',
            });
        }
    });
})();

