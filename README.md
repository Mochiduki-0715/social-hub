# Social Hub

X, Instagram, TikTok, YouTube, Twitchを1つのデスクトップアプリにまとめるSNSブラウザです。

## 主な機能

- 1画面 / 左右2分割表示
- SNSボタンのドラッグ&ドロップで左右画面へ配置
- レイアウト、選択SNSの保存
- 非表示SNSの動画/音声を自動停止
- 外部ブラウザ fallback
- キーボードショートカット

## 起動

```bash
npm run dev
```

## ビルド

```bash
npm run build:app
```

生成物:

```text
src-tauri/target/release/bundle/macos/Social Hub.app
```

## Windows版を作る

Windows PCまたはGitHub Actions上で以下を実行します。

```bash
npm install
npm run build:windows
```

生成物:

```text
src-tauri/target/release/bundle/msi/*.msi
src-tauri/target/release/bundle/nsis/*.exe
```

GitHubに置く場合は、`.github/workflows/build-windows.yml` から手動実行するとWindows用インストーラーをArtifactsとして取得できます。

## ショートカット

- `1` - `5`: 左画面へSNSを選択
- `Shift + 1` - `Shift + 5`: 右画面へSNSを選択して2分割
- `S`: 1画面 / 2分割を切り替え
- `R`: 選択中画面を再読み込み
- `O`: 選択中SNSを外部ブラウザで開く

## 制限

各SNSは公式Web版をWebViewで表示します。サービス側の仕様により、ログインや一部機能が制限される場合があります。
