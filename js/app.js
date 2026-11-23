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

