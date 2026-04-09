# 学籍番号 OCR システム
大学の出席管理ではICカードによる自動化が進む一方で、「ピ逃げ」対策として紙の出席表を使用するケースも多く、手書きデータの入力の手間やOCRの誤認識といった課題があります。本WEBアプリケーションでは、ローカル環境で動作するVLMと人による最終確認を組み合わせた、半自動のデータ化システムを提供します。これにより、プライバシーを守りながらデータ流出を防ぎつつ、確認プロセスを挟むことで高い精度でのデータ化を実現します。

#### デモ

https://github.com/user-attachments/assets/f1e045ac-161e-4aee-8b7e-ba991b5688b6

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

 `index.html` をクリックしブラウザで開いてください。

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
