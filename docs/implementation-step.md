# 実装手順

### 1. 制作の手順

1. **CSS変数と3ペインの画面骨格づくり**
- Nord Theme（Dark / Light）のCSS変数を定義する。
- `title-bar`・3カラム（左右 `side-panel` / 中央 `main-panel`）・`status-bar` の基本レイアウトを組む。
2. **テーマ切替とUIギミックの実装（Alpine.js）**
- Dark / Light 切替に `Persist` と View Transitions API を繋いで、状態保持と色変化の演出を作る。
- 左右サイドバーの `Collapse` 開閉、Nordパレットのクリックコピー、中央パネルのスクロール連動でヘッダが隠れる動きを入れる。
3. **画面切替と静的ページの実装（home / profile）**
- Alpine.jsで `main-panel` 内の表示切替（URLハッシュ連動＋View Transitions）を作り、左サイドのツリーに現在地を反映させる。
- 固定テキスト中心の `profile` と、`home` の自己紹介・各ページへのリンクカードを組む。
4. **API連携・キャッシュ・一覧機能の実装（products / articles）**
- GitHub API（リポジトリ＋アイコン）と Qiita API（記事）の取得処理と、ブラウザへのキャッシュ保存を作る。
- 線区切りリスト、リアルタイム検索、1ページ8件のページネーションを実装して、`home` にも最新2件を流し込む。
5. **キーボード操作とステータスバー連動（仕上げ）**
- `keybind-card` に載せるショートカット（画面移動・ページ送り・検索フォーカス等）を実装する。
- 操作状況に合わせて下部のVim風 `status-bar` の表示が切り替わるように繋ぎ込む。

