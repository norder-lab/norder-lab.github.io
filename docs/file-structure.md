# ファイル構成

```text
portfolio/
├── index.html              # 全体骨格（ヘッダ・3ペイン・ステータスバー・各ページの枠）
├── profile.html            # profile
├── products.html           # products
├── articles.html           # articles
├── css/
│   ├── reset.css           # デフォルトスタイルのリセット
│   ├── tokens.css          # Nord Theme（Dark / Light）のCSS変数
│   ├── layout.css          # ヘッダ・3ペイン・ステータスバーの骨格配置
│   ├── components.css      # side-card・線区切りリスト・検索・ページネーション
│   └── transitions.css     # @view-transition やテーマ変更・ホバー演出
├── js/
│   ├── layout.js           # <portfolio-layout>（共通枠のDOM生成・現在地ハイライト）
│   ├── app.js              # Alpine.jsの全体状態（テーマ切替・開閉・キーバインド・ステータスバー）
│   ├── api.js              # GitHub / Qiita APIの取得とキャッシュ制御
│   └── palette.js          # Nordカラーパレットのデータとコピー処理
└── assets/                 # ファビコンやAPI失敗時の予備アイコンなど
```
