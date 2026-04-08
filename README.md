# 学籍番号 OCR システム
WEBカメラで撮影した出席表から学籍番号を認識・保存するアプリです。

https://github.com/user-attachments/assets/67aff837-18fe-456e-82e6-adb2ea257cbe

## セットアップ

### 1. Python パッケージのインストール

```bash
pip install fastapi uvicorn openai python-multipart pillow
```

### 2. LM Studio の起動

- LM Studio を起動し、`qwen/qwen2.5-vl-7b-instruct`（またはVLM対応モデル）をロード
- Local Server を `http://localhost:1234` で起動

### 3. バックエンドの起動

```bash
uvicorn backend:app --reload --port 8000
```

### 4. フロントエンドを開く

ブラウザで `index.html` をクリックし開いてください。

## 操作方法

| 操作 | 動作 |
|------|------|
| 「カメラを起動」ボタン または `Space` | カメラ起動 |
| マウスドラッグ | 学籍番号のROI（範囲）を選択 → 自動送信 |
| `Enter` | 認識結果を確定・リストへ追加 |
| `Space`（確認中） | やり直し（ROI再選択） |
| 「保存して終了」ボタン | `results.txt` に書き出し |

## API エンドポイント

| エンドポイント | 説明 |
|---------------|------|
| `GET /api/health` | LM Studio 接続確認 |
| `POST /api/recognize` | ROI画像を送信して学籍番号を取得 |
| `POST /api/save` | リストを `results.txt` に保存 |
