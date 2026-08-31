# CHANGELOG

## Unreleased - 2026-08-31

### GitHub Actions

- `web-project-guide` v1.10.0のReusable Web BaselineをPilot導入。
- Checkout / Node.js 22 / JavaScript・MJS構文確認 / JSON Parseの共通BaselineをGuide側へ委譲。
- Reusable Workflowは`web-project-guide`のMerge Commit SHA `c526f3fc37c89972480b69b249ace017437f6813`へ固定し、中央`main`変更の即時伝播を避ける。
- DesignShelf固有の`node scripts/validate-data.mjs`はProject側Workflowへ維持。

### 疑似サイトプレビュー

- STEP 2のレイアウト見本を、線と四角中心のワイヤーフレームから実サイト風の疑似表示へ変更。
- `css/site-preview.css` を追加。
- ロゴ、ナビ、見出し、説明、ボタン、カード、検索欄、タブ、表、サイドナビなどを中立的なダミー文言で表示。
- STEP 1で選んだ配色を疑似サイトへそのまま反映。
- 75 / 20 / 5の主従を維持し、少量アクセントは小さなバッジ・記号・強調に限定。
- グラデーションは追加していない。
- `標準 / 余白広め / 情報多め / スマホ重視` の違いを疑似サイトの見た目へ反映。
- スマホ重視では、カード内に細いスマホ幅ビューポートを疑似表示。
- STEP 3の最終プレビューにも同じ実サイト風表示を反映。
- レストラン・EC・学習サイト等の具体用途は追加せず、レイアウトデータと完成プロンプトは中立性を維持。

## v0.3.0 - 2026-08-29

他の自作GitHubプロジェクトで日常利用しやすかった設計を、DesignShelf向けに必要な範囲だけ横展開。

- `js/shell.js` / `css/shell.css` を追加し、共通アプリシェルを分離。
- Semantic Version `v0.3.0` と BUILD `20260829-1` を追加。
- ヘッダーとフッターで現在バージョンを確認できるようにした。
- コンパクト表示を追加。
- 動きを減らす設定を追加。
- OSのダークモード設定を初回テーマへ反映。
- safe-area対応を追加。
- `prefers-reduced-motion` 対応を追加。
- `/` / `R` / `T` / `?` / `Esc` ショートカットを追加。
- ヘルプダイアログを追加。
- ブラウザ内データ診断を追加。
- 配色・レイアウトの0件表示に復帰操作を追加。
- 最近選んだ配色・骨格を最大6件表示。
- フィルタ・タブの `aria-pressed` / `aria-checked` を改善。
- カラーコードコピー時の短い視覚フィードバックを追加。
- モバイルヘッダーを横スクロール可能な2段構成へ調整し、常駐サイドバーは追加しない方針を維持。
- `tests/data-integrity.html` を追加。
- GitHub ActionsのJavaScript構文確認に `js/shell.js` を追加。

## v0.2.0 - 2026-08-29

- 公開名称をDesignShelfへ統一。
- GitHub Pages専用構成へ整理。
- 配色データのJS複製を削除し、JSONを唯一の正本に変更。
- 配色データから未使用の説明文・プロンプト・用途情報を削除。
- STEP 1の印象タグを検索専用に変更し、完成プロンプトから除外。
- 配色比率を75% / 20% / 5%に統一。
- 64件として並んでいた重複レイアウトを廃止。
- 24種類の異なる骨格 + 4バリエーション切り替えへ変更。
- localStorageをID保存方式へ変更。
- WCAGコントラスト計算による文字色選択へ変更。
- 固定選択ドックとsticky検索UIを廃止。
- CSS / JavaScriptを役割別に整理。
- READMEを現在仕様だけに書き直し、変更履歴を本ファイルへ分離。
- GitHub Actionsによる自動検証を追加。
