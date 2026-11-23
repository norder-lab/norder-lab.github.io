/**
 * ==========================================================================
 * layout.js
 * Web Components (<portfolio-layout>) による共通外枠（ヘッダ / 3ペイン /
 * ステータスバー）のDOM展開、および現在URLに基づくツリー現在地判定を担当。
 * ※状態管理・API通信・イベント制御は app.js 側に分離し、ここには書かない。
 * ==========================================================================
 */

class PortfolioLayout extends HTMLElement {
    connectedCallback() {
        if (this.dataset.initialized) return;
        this.dataset.initialized = 'true';
        const content = this.innerHTML;
        const current = location.pathname.split('/').pop() || 'index.html';

        this.innerHTML = `
            <header>
                <a href="./index.html" class="site-title">
                    <i data-lucide="astroid" aria-hidden="true"></i>
                    <span>norder's portfolio</span>
                </a>
            </header>

            <div class="central-panel">

                <!-- 左サイドパネル -->
                <aside class="side-panel">

                    <!-- 名前カード -->
                    <div class="side-card name-card">
                        <img src="https://github.com/norder-lab.png" alt="norder's icon" onerror="this.src='./assets/fallback-avatar.svg'"/>
                        <p>norder</p>
                    </div>

                    <!-- Qiita / GitHub カード -->
                    <div class="side-card links-card">
                        <h2>
                            <span class="card-heading">
                                <i data-lucide="link" aria-hidden="true"></i>
                                <span>links</span>
                            </span>
                        </h2>
                        <div class="links-list">
                            <a href="https://github.com/norder-lab" target="_blank" rel="noopener noreferrer">
                                <img src="https://cdn.simpleicons.org/github/5e81ac" alt="" class="brand-icon" aria-hidden="true">
                                <span>GitHub</span>
                                <i data-lucide="arrow-up-right" class="external-icon" aria-hidden="true"></i>
                            </a>
                            <a href="https://qiita.com/norder" target="_blank" rel="noopener noreferrer">
                                <img src="https://cdn.simpleicons.org/qiita/5e81ac" alt="" class="brand-icon" aria-hidden="true">
                                <span>Qiita</span>
                                <i data-lucide="arrow-up-right" class="external-icon" aria-hidden="true"></i>
                            </a>
                        </div>
                    </div>

                    <!-- ディレクトリツリーカード -->
                    <nav class="side-card dir-tree-card">
                        <h2>
                            <span class="card-heading">
                                <i data-lucide="folder-tree" aria-hidden="true"></i>
                                <span>directory tree</span>
                            </span>
                        </h2>
                        <ul x-show="cards.tree" x-collapse>
                            <li><a href="./index.html"><i data-lucide="house" aria-hidden="true"></i><span>&frasl;home ~</span></a></li>
                            <li><a href="./profile.html"><i data-lucide="user" aria-hidden="true"></i><span>profile</span></a></li>
                            <li><a href="./products.html"><i data-lucide="folder-code" aria-hidden="true"></i><span>products</span></a></li>
                            <li><a href="./articles.html"><i data-lucide="file-text" aria-hidden="true"></i><span>articles</span></a></li>
                        </ul>
                    </nav>

                </aside>

                <main class="main-panel" @scroll="handleScroll($event)">
                    ${content}
                    <hr>
                    <p class="copyright">© 2026 norder</p>
                </main>

                <!-- 右サイドパネル -->
                <aside class="side-panel">

                    <!-- キーバインドカード -->
                    <div class="side-card keybinds-card">
                        <h2>
                            <span class="card-heading">
                                <i data-lucide="keyboard" aria-hidden="true"></i>
                                <span>keybind</span>
                            </span>
                        </h2>
                        <div class="keybind-list">
                            <div class="keybind"><span>page jump</span><kbd>1-4</kbd></div>
                            <div class="keybind"><span>scroll</span><kbd>j / k</kbd></div>
                            <div class="keybind"><span>top</span><kbd>gg</kbd></div>
                            <div class="keybind"><span>bottom</span><kbd>G</kbd></div>
                        </div>
                    </div>

                    <!-- パレットカード -->
                    <div class="side-card palette-card" x-data="paletteCard">
                        <h2>
                            <span class="card-heading">
                                <i data-lucide="palette" aria-hidden="true"></i>
                                <span>nord palette</span>
                            </span>
                        </h2>
                        <div class="palette-grid">
                            <template x-for="color in colors" :key="color.name">
                                <button
                                    type="button"
                                    class="palette-swatch"
                                    :class="{ 'is-copied': copiedName === color.name }"
                                    :style="{ backgroundColor: color.hex }"
                                    :title="color.name + ' (' + color.hex + ')'"
                                    :aria-label="color.name + ' ' + color.hex + ' をコピー'"
                                    @click="copyColor(color)"
                                ></button>
                            </template>
                        </div>
                        <p class="palette-feedback" :class="{ 'is-copied': Boolean(copiedText) }" aria-live="polite"
                           x-text="copiedText || 'click a color to copy'"></p>
                    </div>

                </aside>

            </div>
        `;

        this.querySelectorAll('.dir-tree-card a').forEach((a) => {
            if (a.getAttribute('href')?.endsWith(current)) {
                a.setAttribute('aria-current', 'page');
            }
        });

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
}
customElements.define('portfolio-layout', PortfolioLayout);
