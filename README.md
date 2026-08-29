# DesignShelf

**Version: v0.3.0**  
**Build: 20260829-1**

配色と画面レイアウトを別々に選び、AIへ渡すWebデザイン指示を生成するGitHub Pages向け静的ツールです。

## 目的

DesignShelfは完成済みサイトを選ぶテンプレート集ではありません。

1. **STEP 1**: 3色配色だけを選ぶ
2. **STEP 2**: 業種・題材を持たない画面骨格を選ぶ
3. **STEP 3**: 作りたい内容を任意入力し、配色・骨格と合成したプロンプトを作る

配色名やレイアウト名から、サイトの題材・文章・機能を勝手に決めないことを重要仕様とします。

## 現在のデータ

- 配色: **100件**
- レイアウト骨格: **24件**
- レイアウトバリエーション: **4種**（標準 / 余白広め / 情報多め / スマホ重視）
- 組み合わせ: **96通り**
- 配色比率: **75% / 20% / 5%**

## v0.3.0

他の自作GitHubプロジェクトで使いやすかった設計を、DesignShelf向けに必要な部分だけ取り入れました。

- AP Study Notes: 共通シェル、安全なlocalStorage、検索ショートカット
- ASMRTube: データ診断、0件時の復帰導線、reduced-motion
- Lineup Lab: バージョン表示、コンパクト表示、UIとコア処理の分離
- LyricTube: Semantic Version + BUILD、safe-area、focus-visible
- VReview: 現在バージョンを追跡しやすい運用

## 主な機能

### STEP 1

- 配色100件
- 75 : 20 : 5カラーバー
- 色タイプ / 印象タグ / 検索
- お気に入り
- 最大3件比較
- 本日の配色 / ランダム提案
- カラーコード1クリックコピー
- 最近選んだ配色 最大6件

印象タグは検索専用で、完成プロンプトには入りません。

### STEP 2

- 24種類の固有画面骨格
- STEP 1の配色をワイヤーフレームへ反映
- 4バリエーション切替
- 構造タイプ / 検索 / ランダム提案
- 最近選んだ骨格 最大6件
- 説明は画面構造だけに限定

### STEP 3

- 配色 + 骨格 + 自由入力を合成
- 自由入力を最優先
- HTML/CSS/JS分割 / 単一HTML / 小プロジェクト形式
- CSS変数化オプション
- コピー / txt保存

### 共通UI

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

## 0件表示

絞り込みで候補が0件になった場合、空白だけにせず以下を表示します。

- 絞り込みを解除
- 全候補からランダム提案

## データ診断

`設定` → `データ診断` から確認できます。

- 配色100件 / 骨格24件
- ID重複
- wireframe重複
- HEX形式
- 白/黒文字コントラスト
- 選択中IDの有効性

診断は確認だけ行い、データを勝手に変更しません。

## データ構成

配色100件は用途別ではなく**色タイプごとに10件ずつ**分割しています。`data/palettes.json` は正本ファイル一覧のマニフェストです。

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

1配色の形式:

```json
{
  "id": "palette-001",
  "number": 1,
  "name": "アイボリー / トープ / テラコッタ",
  "category": "ベージュ系",
  "tags": ["上品", "ナチュラル", "温かい"],
  "colors": {
    "base": "#f8f1e7",
    "main": "#8b6f47",
    "tiny": "#c4472d"
  }
}
```

`tags` は検索専用です。

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
│  └─ pages.css
├─ js/
│  ├─ shared.js
│  ├─ shell.js
│  ├─ colors.js
│  ├─ layouts.js
│  └─ result.js
├─ data/
│  ├─ palettes.json
│  ├─ palettes/*.json
│  └─ layouts.json
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
7. バリエーションを別カードとして水増ししない。
8. localStorageへ選択データ本体を保存せずIDだけ保存する。
9. 壊れたlocalStorageや古いIDでサイト全体を停止させない。
10. sticky目次や常駐選択ドックを再導入しない。
11. APIキーや秘密情報を公開リポジトリへ入れない。
12. 重い常時アニメーションを追加しない。

## localStorage

- `designShelf.theme`
- `designShelf.preferences.v1`
- `designShelf.selectedPaletteId`
- `designShelf.selectedLayoutId`
- `designShelf.selectedVariant`
- `designShelf.favorites`
- `designShelf.compare`
- `designShelf.recentPalettes.v1`
- `designShelf.recentLayouts.v1`
- `designShelf.brief`

## GitHub Pages

想定URL:

`https://elitemay.github.io/DesignShelf/`

`Settings` → `Pages` → `Deploy from a branch` → `main` / `/ (root)`。

## 品質チェック

GitHub Actionsでpush / pull request時に以下を確認します。

- データ件数
- ID / wireframe重複
- 色コード / 色差 / コントラスト
- 具体用途語の混入
- HTML参照切れ
- グラデーション / sticky UI再混入
- JavaScript構文

ブラウザ簡易確認:

`tests/data-integrity.html`

ローカル確認:

```bash
node scripts/validate-data.mjs
node --check js/shared.js
node --check js/shell.js
node --check js/colors.js
node --check js/layouts.js
node --check js/result.js
```

## 注意

- `fetch()` を使うため `file://` 直開きは正式対応しません。
- 配色の主観的なセンスは自動検証だけでは保証できないため、今後も人間の目で見直します。
- 実機スマートフォンとGitHub Pages公開URLでの最終通し確認は別途必要です。
