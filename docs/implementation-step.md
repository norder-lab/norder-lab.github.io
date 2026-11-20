# 実装手順

1. **CSS変数と共通レイアウト骨格づくり**
- `tokens.css` に Nord Theme（Dark / Light）のCSS変数を定義する。
- `layout.css` と `layout.js`（Web Components `<portfolio-layout>`）で、`title-bar`・3カラム（左右 `side-panel` / 中央 `main-panel`）・`status-bar` の共通外枠を組む。
- `layout.js` 内で `location.pathname` を判定し、左サイドのディレクトリツリーに現在地を自動反映させる。
2. **テーマ切替・ページ遷移演出とUIギミックの実装**
- Dark / Light 切替に Alpine.js の `Persist` と `document.startViewTransition()` を繋いで、ページ移動をまたいだ状態保持と色変化の演出を作る。
- `transitions.css` に `@view-transition { navigation: auto; }` を定義し、HTML間のページ移動時の遷移演出を入れる。
- 左右サイドバーの `Collapse` 開閉（状態も `Persist` で保持）、Nordパレットのクリックコピー、中央 `main-panel` のスクロール連動でヘッダが隠れる動きを入れる。
3. **静的ページの実装（home / profile）**
- `index.html` と `profile.html` を用意し、各ページ固有の中身を `<portfolio-layout>` で囲む形で作成する。
- 固定テキスト中心の `profile.html`（about me / design stance / language roles / vision / meta data）と、`index.html` の簡単な自己紹介・各ページへのリンクカードを組む。
4. **API連携・キャッシュ・一覧機能の実装（products / articles）**
- `api.js` に GitHub API（リポジトリ＋アイコン）と Qiita API（記事）の取得処理と、ブラウザへのキャッシュ保存を作る。
- `products.html` と `articles.html` を作成し、線区切りリスト、リアルタイム検索、1ページ8件のページネーションを実装する。
- `index.html` にも `api.js` を繋ぎ、最新の products と articles を2件ずつ流し込む。
5. **キーボード操作とステータスバー連動（仕上げ）**
- `keybind-card` に載せるショートカット（各ページへの遷移・ページ送り・検索フォーカス等）を `app.js` に実装する。
- 操作状況や表示中のページに合わせて下部のVim風 `status-bar` の表示が切り替わるように繋ぎ込む。
