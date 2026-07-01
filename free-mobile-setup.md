# 無料でスマホアプリ風に使う手順

## 1. 開発中に同じWi-Fiのスマホで見る

PCとスマホを同じWi-Fiにつなぎ、PC側で起動する。

```powershell
npm.cmd run dev:lan
```

PCのIPv4アドレスを確認し、スマホのブラウザで開く。

```text
http://PCのIPv4アドレス:3000/dashboard
```

この方法は画面確認向け。スマホのマイク録音はHTTPだと制限される場合がある。

## 2. 録音までスマホで使う

録音を安定して使うにはHTTPSが必要。長期コストゼロで使う場合はGitHub Pages版を使う。

```text
https://kamihikooki424-ai.github.io/piano-competition-note-pwa/
```

このURLをスマホで開くと、マイク許可を出して録音機能を使える。

## 3. ホーム画面に追加する

iPhone:

1. SafariでGitHub PagesのURLを開く
2. 共有ボタンを押す
3. 「ホーム画面に追加」を選ぶ

Android:

1. ChromeでGitHub PagesのURLを開く
2. メニューを開く
3. 「ホーム画面に追加」または「アプリをインストール」を選ぶ

## 4. 無料運用の推奨構成

まずはこの順番で進める。

1. PWAとしてホーム画面に追加
2. GitHub Pagesで公開
3. データは端末内localStorageに保存
4. 必要に応じてJSONバックアップを書き出す

長期コストゼロを優先する場合、外部DBと外部ストレージは使わない。
