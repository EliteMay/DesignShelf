# DesignShelf

**Version: v0.3.0**  
**Build: 20260829-1**

配色と画面レイアウトを別々に選び、AIへ渡すWebデザイン指示を生成するGitHub Pages向け静的ツールです。

## 目的

DesignShelfは完成済みサイトを選ぶテンプレート集ではありません。

1. **STEP 1**: 3色配色だけを選ぶ
2. **STEP 2**: 業種・題材を持たない画面骨格を、疑似サイトとして見ながら選ぶ
3. **STEP 3**: 作りたい内容を任意入力し、配色・骨格と合成したプロンプトを作る

配色名やレイアウト名から、サイトの題材・文章・機能を勝手に決めないことを重要仕様とします。

## 現在のデータ

- 配色: **100件**
- レイアウト骨格: **24件**
- レイアウトバリエーション: **4種**（標準 / 余白広め / 情報多め / スマホ重視）
- 組み合わせ: **96通り**
- 配色比率: **75% / 20% / 5%**

## STEP 1 — 配色

- 配色100件
- 75 : 20 : 5カラーバー
- 色タイプ / 印象タグ / 検索
- お気に入り
- 最大3件比較
- 本日の配色 / ランダム提案
- カラーコード1クリックコピー
- 最近選んだ配色 最大6件

印象タグは検索専用で、完成プロンプトには入りません。

## STEP 2 — レイアウト

- 24種類の固有画面骨格
- STEP 1の配色をプレビューへ反映
- 4バリエーション切替
- 構造タイプ / 検索 / ランダム提案
- 最近選んだ骨格 最大6件
- 説明は画面構造だけに限定

### 疑似サイトプレビュー

以前の「線・四角だけ」のワイヤーフレーム表示を、**実際のWebサイトに近い見た目の疑似プレビュー**へ改善しています。

表示する汎用部品:

- ブラウザ枠
- ロゴ / ナビ
- メイン見出し
- 短い説明
- ボタン
- カード
- 表示・画像枠
- 検索欄
- タブ
- サイドナビ
- 表
- タイムライン

重要な仕様:

- `BRAND` / `Main heading` / `Card title` などの**中立的なダミー文言だけ**を使う。
- レストラン、EC、学習サイトなどの具体的な題材はプレビューから決めない。
- 選んだ配色をベース75% / 主アクセント20% / 少量アクセント5%の役割で反映する。
- グラデーションは使用しない。
- `標準 / 余白広め / 情報多め / スマホ重視` はプレビューの見た目自体にも反映する。
- `スマホ重視` はカード内にスマホ幅の疑似ビューポートを表示する。

疑似サイト表示は `css/site-preview.css` が担当し、JSONのレイアウト構造やAIプロンプトの内容は変更しません。

## STEP 3 — プロンプト

- 配色 + 骨格 + 自由入力を合成
- 自由入力を最優先
- HTML/CSS/JS分割 / 単一HTML / 小プロジェクト形式
- CSS変数化オプション
- コピー / txt保存
- STEP 2と同じ疑似サイトを大きく最終確認

## 共通UI

- ライト / ダーク
- コンパクト表示
- 動きを減らす設定
- ヘルプ
- データ診断
- Version / BUILD表示
- safe-area / focus-visible / prefers-reduced-motion

ショートカット:

| キー | 動作 |
|---|---|
| `/` | 検索へ移動 |
| `R` | ランダム提案 |
| `T` | テーマ切替 |
| `?` | ヘルプ |
| `Esc` | ダイアログを閉じる |

## データ構成

```text
data/
├─ palettes.json
├─ palettes/
│  ├─ beige.json
│  ├─ blue.json
│  ├─ green.json
│  ├─ pink.json
│  ├─ purple.json
│  ├─ dark.json
│  ├─ mono.json
│  ├─ warm.json
│  ├─ japanese.json
│  └─ pop.json
└─ layouts.json
```

`data/palettes.json` は配色ファイル一覧のマニフェストです。配色データをJavaScriptへ複製しません。

## ファイル構成

```text
DesignShelf/
├─ index.html
├─ layouts.html
├─ result.html
├─ css/
│  ├─ base.css
│  ├─ components.css
│  ├─ shell.css
│  ├─ pages.css
│  └─ site-preview.css
├─ js/
│  ├─ shared.js
│  ├─ shell.js
│  ├─ colors.js
│  ├─ layouts.js
│  └─ result.js
├─ data/
├─ scripts/validate-data.mjs
├─ tests/data-integrity.html
├─ .github/workflows/validate.yml
├─ docs/
├─ CHANGELOG.md
└─ README.md
```

## 崩してはいけない仕様

1. GitHub Pagesだけで動く静的HTML/CSS/JS構成を維持する。
2. 配色はJSONを正本にし、JSへ同じデータを複製しない。
3. 配色は75 / 20 / 5の主従を守る。
4. 印象タグをAIプロンプトへ渡さない。
5. 背景全体を自動グラデーション化しない。
6. レイアウトへ具体的な業種・題材を書かない。
7. 疑似サイトプレビューも具体的な業種・題材を持たせない。
8. バリエーションを別カードとして水増ししない。
9. localStorageへ選択データ本体を保存せずIDだけ保存する。
10. 壊れたlocalStorageや古いIDでサイト全体を停止させない。
11. sticky目次や常駐選択ドックを再導入しない。
12. APIキーや秘密情報を公開リポジトリへ入れない。
13. 重い常時アニメーションを追加しない。

## GitHub Pages

想定URL:

`https://elitemay.github.io/DesignShelf/`

`Settings` → `Pages` → `Deploy from a branch` → `main` / `/ (root)`。

## 品質チェック

GitHub Actionsでpush / pull request時に、データ件数、重複、色コード、参照切れ、JavaScript構文などを確認します。

ブラウザ簡易確認:

`tests/data-integrity.html`

## 注意

- `fetch()` を使うため `file://` 直開きは正式対応しません。
- 疑似サイトは「完成サイトそのもの」ではなく、配色と構造を選びやすくするための中立的な見本です。
- 配色の主観的なセンスは自動検証だけでは保証できないため、今後も人間の目で見直します。
- 実機スマートフォンとGitHub Pages公開URLでの全パターン視覚確認は別途必要です。
