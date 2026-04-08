"""
学籍番号認識 WEBアプリ - バックエンド (FastAPI)
実行方法: pip install fastapi uvicorn openai python-multipart pillow
         uvicorn backend:app --reload --port 8000
"""

import base64
import json
import os
from datetime import datetime
from io import BytesIO
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from openai import APIConnectionError, OpenAI
from PIL import Image
from pydantic import BaseModel

app = FastAPI(title="学籍番号認識 API")

# CORS設定（フロントエンドからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# LM Studio クライアント
lm_client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")

RESULTS_FILE = Path("results.txt")


class RecognizeRequest(BaseModel):
    image_base64: str  # data:image/jpeg;base64,... 形式 or 生base64


class SaveRequest(BaseModel):
    student_ids: list[str]


@app.post("/api/recognize")
async def recognize(req: RecognizeRequest):
    """ROI画像をLM Studioへ送り学籍番号を返す"""
    try:
        # data URL プレフィックスを除去
        raw = req.image_base64
        if raw.startswith("data:"):
            raw = raw.split(",", 1)[1]

        image_bytes = base64.b64decode(raw)

        # 画像の検証（二値化なし・カラーのまま）
        try:
            img = Image.open(BytesIO(image_bytes))
            img.verify()
        except Exception:
            raise HTTPException(status_code=400, detail="無効な画像データです。")

        # Base64再エンコード（JPEG形式で送信）
        buf = BytesIO()
        img = Image.open(BytesIO(image_bytes))  # verify後は再オープン必要
        img.save(buf, format="JPEG", quality=95)
        encoded = base64.b64encode(buf.getvalue()).decode("utf-8")

        # LM Studio API 呼び出し
        response = lm_client.chat.completions.create(
            model="qwen/qwen2.5-vl-7b-instruct",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """# Role
You are a high-precision OCR engine specialized in extracting Japanese University Student ID numbers.

# Task
Extract the 7-digit student ID number from the provided image.

# Format Rules (STRICT)
- Output ONLY the 7-digit ID.
- Do NOT include any introductory text, labels, or explanations.
- Do NOT include spaces or line breaks.
- If the ID is "20X5034", your response must be exactly "20X5034".

# Examples
- Image content: [20X5034] -> Response: 20X5034
- Image content: [19A1234] -> Response: 19A1234

# Input Image Analysis
Please extract the ID from the image below:""",
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{encoded}"},
                        },
                    ],
                }
            ],
            max_tokens=300,
        )

        result = response.choices[0].message.content.strip()
        return {"success": True, "student_id": result}

    except APIConnectionError:
        raise HTTPException(
            status_code=503,
            detail="LM Studio に接続できません。http://localhost:1234 が起動しているか確認してください。",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"認識エラー: {str(e)}")


@app.post("/api/save")
async def save_results(req: SaveRequest):
    """確定済みリストを results.txt に保存"""
    if not req.student_ids:
        raise HTTPException(status_code=400, detail="保存するデータがありません。")

    try:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(RESULTS_FILE, "w", encoding="utf-8") as f:
            f.write(f"# 保存日時: {timestamp}\n")
            for sid in req.student_ids:
                f.write(f"{sid}\n")

        return {
            "success": True,
            "message": f"{len(req.student_ids)} 件を {RESULTS_FILE.resolve()} に保存しました。",
            "count": len(req.student_ids),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ファイル保存エラー: {str(e)}")


@app.get("/api/health")
async def health():
    """LM Studio の接続確認"""
    try:
        models = lm_client.models.list()
        return {
            "status": "ok",
            "lm_studio": "connected",
            "models": [m.id for m in models.data],
        }
    except APIConnectionError:
        return {
            "status": "degraded",
            "lm_studio": "disconnected",
            "message": "LM Studio に接続できません",
        }
    except Exception as e:
        return {"status": "degraded", "lm_studio": "error", "message": str(e)}


# フロントエンドを静的ファイルとして配信（オプション）
# app.mount("/", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
