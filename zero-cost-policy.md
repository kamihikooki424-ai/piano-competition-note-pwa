# 長期コストゼロ方針

## 結論

長期的に費用を必ず発生させない前提では、クラウドDB、クラウドStorage、サーバー実行環境を使わない。

無料枠は将来変更される可能性があるため、アプリの本命は静的PWAとする。

## 採用する構成

- ホスティング: GitHub Pages
- アプリ形式: 静的HTML/CSS/JavaScript
- データ保存: 端末内のlocalStorage
- 録音: ブラウザのMediaRecorder
- バックアップ: JSON書き出し/読み込み

## コストを発生させないために使わないもの

- Supabase
- Vercel
- Neon
- S3
- Firebase
- 外部DB
- 外部Storage
- 有料ドメイン
- ネイティブアプリ配布

## 制約

- データは端末ごとに保存される
- 先生とのリアルタイム共有はできない
- 機種変更時はJSONバックアップが必要
- 録音データは必要に応じて端末へ保存する

## GitHub Pagesの注意

GitHub Freeでは、GitHub Pagesはpublic repositoryで利用できる。private repositoryでのPages公開は無料運用の前提にしない。

そのため、公開する場合はリポジトリをpublicにするか、静的PWAだけをpublic用リポジトリに分ける。
