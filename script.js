'use strict';

const THEME_STORAGE_KEY = 'norder-portfolio-theme';
const GITHUB_USER = 'norder-lab';
const REPOS_API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;
const EXCLUDED_REPOS = [
    'norder-lab',
    'norder-lab.github.io',
];

function getInitialTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
        return saved;
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.textContent = theme === 'dark' ? 'Light' : 'Dark';
        toggleBtn.setAttribute(
            'aria-label',
            theme === 'dark' ? 'ライトテーマに切り替え' : 'ダークテーマに切り替え'
        );
    }
}

function initTheme() {
    applyTheme(getInitialTheme());

    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            localStorage.setItem(THEME_STORAGE_KEY, next);
            applyTheme(next);
        });
    }

    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
            applyTheme(e.matches ? 'light' : 'dark');
        }
    });
}

function isValidHttpUrl(urlString) {
    if (!urlString) return false;
    try {
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function createWorkCard(repo) {
    const card = document.createElement('article');
    card.className = 'work-card';

    const body = document.createElement('div');

    const top = document.createElement('div');
    top.className = 'work-top';

    const titleLink = document.createElement('a');
    titleLink.className = 'work-title';
    titleLink.href = repo.html_url;
    titleLink.target = '_blank';
    titleLink.rel = 'noopener noreferrer';
    titleLink.textContent = repo.name;
    top.appendChild(titleLink);

    if (repo.language) {
        const langSpan = document.createElement('span');
        langSpan.className = 'work-lang';
        langSpan.textContent = repo.language;
        top.appendChild(langSpan);
    }

    const desc = document.createElement('p');
    desc.className = repo.description ? 'work-desc' : 'work-desc empty';
    desc.textContent = repo.description || 'No description provided.';

    body.appendChild(top);
    body.appendChild(desc);
    card.appendChild(body);

    const hasTopics = Array.isArray(repo.topics) && repo.topics.length > 0;
    const hasHomepage = isValidHttpUrl(repo.homepage);

    if (hasTopics || hasHomepage) {
        const footer = document.createElement('div');
        footer.className = 'work-footer';

        if (hasTopics) {
            const topicsDiv = document.createElement('div');
            topicsDiv.className = 'work-topics';
            for (const topic of repo.topics) {
                const badge = document.createElement('span');
                badge.className = 'topic-badge';
                badge.textContent = topic;
                topicsDiv.appendChild(badge);
            }
            footer.appendChild(topicsDiv);
        }

        if (hasHomepage) {
            const demoLink = document.createElement('a');
            demoLink.className = 'work-demo';
            demoLink.href = repo.homepage;
            demoLink.target = '_blank';
            demoLink.rel = 'noopener noreferrer';
            demoLink.textContent = 'Demo / Page ->';
            footer.appendChild(demoLink);
        }

        card.appendChild(footer);
    }

    return card;
}

function renderFallback(container) {
    container.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'status-text';
    p.textContent = 'リポジトリ一覧を取得できませんでした。 ';

    const link = document.createElement('a');
    link.className = 'fallback-link';
    link.href = `https://github.com/${GITHUB_USER}?tab=repositories`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'GitHub でリポジトリ一覧を見る';

    p.appendChild(link);
    container.appendChild(p);
}

async function loadWorks() {
    const container = document.getElementById('works-container');
    if (!container) return;

    try {
        const response = await fetch(REPOS_API_URL, {
            headers: {
                Accept: 'application/vnd.github.v3+json',
            },
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const repos = await response.json();
        const filtered = repos
            .filter((repo) => !repo.fork && !EXCLUDED_REPOS.includes(repo.name))
            .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

        container.innerHTML = '';

        if (filtered.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.className = 'status-text';
            emptyMsg.textContent = '公開中の制作物はまだありません。';
            container.appendChild(emptyMsg);
            return;
        }

        const fragment = document.createDocumentFragment();
        for (const repo of filtered) {
            fragment.appendChild(createWorkCard(repo));
        }
        container.appendChild(fragment);
    } catch {
        renderFallback(container);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadWorks();
});
