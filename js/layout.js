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
            this.innerHTML = `
                <header>
                    <p class="site-title">norder's portfolio</p>
                    <button type="button" class="theme-btn" id="theme-toggle">dark</button>
                </header>

                <div class="central-panel">

                    <!-- 左サイドパネル -->
                    <aside class="side-panel">

                        <!-- 名前カード -->
                        <div class="side-card name-card">
                            <img src="https://github.com/norder-lab.png" alt="norder's icon"/>
                            <p>norder</p>
                        </div>

                        <!-- Qiita / GitHub カード -->
                        <div class="side-card links-card">
                            <h2>links</h2>
                            <div> </div>
                            <div> </div>
                        </div>

                        <!-- ディレクトリツリーカード -->
                        <nav class="side-card dir-tree-card">
                            <h2>directory tree</h2>
                            <ul>
                                <li><a href="./index.html">&frasl;home ~</a></li>
                                <li><a href="./profile.html">profile</a></li>
                                <li><a href="./products.html">products</a></li>
                                <li><a href="./articles.html">articles</a></li>
                            </ul>
                        </nav>

                    </aside>

                    <main class="main-panel">
                        ${content}
                        <hr>
                        <p>© 2026- norder</p>
                    </main>

                    <!-- 右サイドパネル -->
                    <aside class="side-panel">

                        <!-- キーバインドカード -->
                        <div class="side-card keybinds-card">
                            <h2>keybind</h2>
                            <div class="keybind"></div>
                            <div class="keybind"></div>
                            <div class="keybind"></div>
                        </div>

                        <!-- パレットカード -->
                        <div class="side-card palette-card">
                            <h2>nord palette</h2>
                            <div class="palette-grid"> </div>
                        </div>

                    </aside>

                </div>

                <!-- ステータスバー(下に常時表示) -->
                <footer class="status-bar">
                </footer>
            `;

            const current = location.pathname.split('/').pop() || 'index.html';
            this.querySelectorAll('.dir-tree-card a').forEach((a) => {
                if (a.getAttribute('href')?.endsWith(current)) {
                    a.setAttribute('aria-current', 'page');
                }
            });
        }
    }
customElements.define('portfolio-layout', PortfolioLayout);
