# Social Hub

X, Instagram, TikTok, YouTube, Twitchを1つのデスクトップアプリにまとめるSNSブラウザです。

## 主な機能

- 1画面 / 左右2分割表示
- SNSボタンのドラッグ&ドロップで左右画面へ配置
- レイアウト、選択SNSの保存
- 非表示SNSの動画/音声を自動停止
- 外部ブラウザ fallback
- キーボードショートカット

## 開発環境のセットアップ

[Node.js](https://nodejs.org/)（22以上推奨）と [Rust](https://www.rust-lang.org/tools/install) ツールチェーンが必要です。

```bash
npm install
```

## 起動（開発モード）

```bash
npm run dev
```

## ビルド

OSごとに、そのOS上でビルドします（クロスコンパイルは未対応）。

### macOS版

macOS上で実行します。

```bash
npm install
npm run build:app
```

生成物:

```text
src-tauri/target/release/bundle/macos/Social Hub.app
```

### Windows版

Windows PC上で実行します。事前にNode.jsとRustをインストールしてください。

```bash
npm install
npm run build:windows
```

生成物:

```text
src-tauri/target/release/bundle/msi/*.msi
src-tauri/target/release/bundle/nsis/*.exe
```

> macOS / Linux上で `npm run build:windows` を実行するとエラーになります（Windowsインストーラーはwin32環境でのみ作成可能）。

#### GitHub Actionsで作る（Windows PCがない場合）

`main` ブランチへの push 時に自動でWindowsビルドが走ります。手動で実行する場合は、GitHubの **Actions** タブから **Build Windows** ワークフローを選び **Run workflow** を実行します。完了後、Artifactsの `social-hub-windows` からインストーラー（`.msi` / `.exe`）をダウンロードできます。

## ショートカット

- `1` - `5`: 左画面へSNSを選択
- `Shift + 1` - `Shift + 5`: 右画面へSNSを選択して2分割
- `S`: 1画面 / 2分割を切り替え
- `R`: 選択中画面を再読み込み
- `O`: 選択中SNSを外部ブラウザで開く

## 制限

各SNSは公式Web版をWebViewで表示します。サービス側の仕様により、ログインや一部機能が制限される場合があります。
