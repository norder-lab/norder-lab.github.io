/**
 * ==========================================================================
 * api.js
 * GitHub API（リポジトリ・アイコン）および Qiita API（記事）の非同期取得、
 * ブラウザキャッシュ制御、検索・ページネーション用のデータ整形を担当。
 * ==========================================================================
 */

(() => {
    const GITHUB_USER = 'norder-lab';
    const GITHUB_REPOS_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;
    const GITHUB_CACHE_KEY = 'portfolio-github-repos-v1';

    const QIITA_USER = 'norder';
    const QIITA_ITEMS_URL = `https://qiita.com/api/v2/users/${QIITA_USER}/items?page=1&per_page=100`;
    const QIITA_CACHE_KEY = 'portfolio-qiita-articles-v1';

    const CACHE_TTL_MS = 60 * 60 * 1000; // 1時間
    const EXCLUDED_REPOS = new Set([
        'norder-lab',
        'norder-lab.github.io',
    ]);

    function isValidHttpUrl(urlString) {
        if (!urlString) return false;
        try {
            const url = new URL(urlString);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
            return false;
        }
    }

    function formatDate(isoString) {
        if (!isoString) return { date: '', datetime: '' };
        const parsed = new Date(isoString);
        if (Number.isNaN(parsed.getTime())) return { date: '', datetime: '' };
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, '0');
        const d = String(parsed.getDate()).padStart(2, '0');
        return {
            date: `${y}/${m}/${d}`,
            datetime: `${y}-${m}-${d}`,
        };
    }

    function readCache(key) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed.fetchedAt !== 'number' || !Array.isArray(parsed.items)) {
                return null;
            }
            return parsed;
        } catch {
            return null;
        }
    }

    function writeCache(key, items) {
        try {
            localStorage.setItem(key, JSON.stringify({
                fetchedAt: Date.now(),
                items,
            }));
        } catch {
            // ストレージ容量超過や制限環境ではキャッシュ保存をスキップ
        }
    }

    /**
     * GitHub リポジトリ一覧を取得・整形して返す（localStorage キャッシュ付き）。
     */
    async function fetchGithubRepos({ force = false } = {}) {
        const cached = readCache(GITHUB_CACHE_KEY);
        if (!force && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
            return cached.items;
        }

        try {
            const response = await fetch(GITHUB_REPOS_URL, {
                headers: {
                    Accept: 'application/vnd.github+json',
                },
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const rawRepos = await response.json();
            const items = rawRepos
                .filter((repo) => !repo.fork && !EXCLUDED_REPOS.has(repo.name))
                .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
                .map((repo) => ({
                    name: repo.name,
                    html_url: isValidHttpUrl(repo.html_url) ? repo.html_url : `https://github.com/${GITHUB_USER}`,
                    description: repo.description || '',
                    language: repo.language || '',
                    pushed_at: repo.pushed_at || '',
                }));

            writeCache(GITHUB_CACHE_KEY, items);
            return items;
        } catch (error) {
            if (cached) {
                return cached.items;
            }
            throw error;
        }
    }

    /**
     * Qiita 公開記事一覧を取得・整形して返す（localStorage キャッシュ付き）。
     */
    async function fetchQiitaArticles({ force = false } = {}) {
        const cached = readCache(QIITA_CACHE_KEY);
        if (!force && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
            return cached.items;
        }

        try {
            const response = await fetch(QIITA_ITEMS_URL, {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Qiita API error: ${response.status}`);
            }

            const rawItems = await response.json();
            const items = rawItems
                .filter((item) => !item.private)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((item) => {
                    const formatted = formatDate(item.created_at);
                    return {
                        id: item.id,
                        title: item.title || '',
                        url: isValidHttpUrl(item.url) ? item.url : `https://qiita.com/${QIITA_USER}`,
                        tags: Array.isArray(item.tags) ? item.tags.map((t) => t?.name).filter(Boolean) : [],
                        created_at: item.created_at || '',
                        date: formatted.date,
                        datetime: formatted.datetime,
                    };
                });

            writeCache(QIITA_CACHE_KEY, items);
            return items;
        } catch (error) {
            if (cached) {
                return cached.items;
            }
            throw error;
        }
    }

    window.PortfolioAPI = {
        fetchGithubRepos,
        fetchQiitaArticles,
    };
})();
