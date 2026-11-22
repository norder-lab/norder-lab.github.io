# ディレクトリ・プロジェクト構造

```plaintext
portfolio/
├── index.html              # home（共通タグで中身を挟むだけ）
├── profile.html            # profile
├── products.html           # products
├── articles.html           # articles
├── css/
│   ├── reset.css           # デフォルトスタイルのリセット
│   ├── tokens.css          # Nord Theme（Dark / Light）のCSS変数
│   ├── layout.css          # ヘッダ・3カラム・ステータスバーの配置
│   ├── components.css      # side-card・線区切りリスト・検索・ページネーション
│   └── transitions.css     # @view-transition やテーマ変更・ホバー演出
└── js/
    ├── layout.js           # <portfolio-layout>（共通枠の展開・現在地判定）
    ├── app.js              # Alpine.js全体制御（テーマ・開閉・キー操作・ステータスバー）
    ├── api.js              # GitHub / Qiita APIの取得とブラウザキャッシュ
    └── palette.js          # Nordカラーパレットのデータとコピー処理
```
