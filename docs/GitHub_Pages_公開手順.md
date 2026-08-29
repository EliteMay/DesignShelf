# GitHub Pages 公開手順

対象: `EliteMay/DesignShelf`

1. GitHubでDesignShelfを開く。
2. `Settings` → `Pages`。
3. Sourceを `Deploy from a branch`。
4. Branch `main`、Folder `/ (root)`。
5. Save。

想定URL: `https://elitemay.github.io/DesignShelf/`

push時は `.github/workflows/validate.yml` がデータ・参照・JavaScript構文を検査します。

公開後の簡易データ確認: `https://elitemay.github.io/DesignShelf/tests/data-integrity.html`

APIキー・パスワード・秘密情報はコミットしないでください。
