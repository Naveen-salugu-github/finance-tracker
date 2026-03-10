from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
import uuid
from datetime import datetime
import requests


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str


class AIInsightsRequest(BaseModel):
    income: float
    expenses: Dict[str, float] = Field(default_factory=dict)


class AIInsightsResponse(BaseModel):
    insights: str


def build_ai_insights_prompt(income: float, expenses: Dict[str, float]) -> str:
    expense_lines = "\n".join(
        f"{category.replace('_', ' ').title()}: {amount}"
        for category, amount in expenses.items()
    )

    if not expense_lines:
        expense_lines = "No expenses provided."

    return (
        "Brutal finance take. Exactly 3 short lines. No intro.\n"
        f"Income: {income}. Expenses: {expense_lines}\n"
        "3 lines only:"
    )


def format_ai_insights(insights: str) -> str:
    cleaned = insights.replace("<think>", "").replace("</think>", "").strip()
    lines = [
        line.strip().lstrip("-*•0123456789. )(").strip()
        for line in cleaned.splitlines()
        if line.strip()
    ]

    if not lines:
        return "Spending is unfocused.\nYour biggest expense needs scrutiny.\nCut waste before it compounds."

    return "\n".join(lines[:3])


async def _call_groq(prompt: str) -> Optional[str]:
    key = os.environ.get("GROQ_API_KEY")
    if not key:
        return None
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 100,
    }
    try:
        response = await asyncio.to_thread(
            requests.post,
            "https://api.groq.com/openai/v1/chat/completions",
            json=payload,
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        return (data.get("choices") or [{}])[0].get("message", {}).get("content")
    except Exception as exc:
        logger.exception("Groq request failed: %s", exc)
        return None


async def _call_openai(prompt: str) -> Optional[str]:
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        return None
    payload = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 100,
    }
    try:
        response = await asyncio.to_thread(
            requests.post,
            "https://api.openai.com/v1/chat/completions",
            json=payload,
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        return (data.get("choices") or [{}])[0].get("message", {}).get("content")
    except Exception as exc:
        logger.exception("OpenAI request failed: %s", exc)
        return None


async def _call_ollama(prompt: str) -> Optional[str]:
    endpoint = os.environ.get("AI_MODEL_ENDPOINT")
    if not endpoint:
        return None
    timeout = int(os.environ.get("AI_MODEL_TIMEOUT_SECONDS", "300"))
    payload = {
        "model": "llama3.2:3b",
        "prompt": prompt,
        "stream": False,
        "options": {"num_predict": 100},
    }
    try:
        response = await asyncio.to_thread(
            requests.post, endpoint, json=payload, timeout=timeout
        )
        response.raise_for_status()
        result = response.json()
        return result.get("response")
    except Exception as exc:
        logger.exception("Ollama request failed: %s", exc)
        return None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


@api_router.post("/ai-insights", response_model=AIInsightsResponse)
async def generate_ai_insights(input: AIInsightsRequest):
    prompt = build_ai_insights_prompt(input.income, input.expenses)

    raw = (
        (await _call_groq(prompt))
        or (await _call_openai(prompt))
        or (await _call_ollama(prompt))
    )

    if not raw or not isinstance(raw, str):
        raise HTTPException(status_code=503, detail="AI insights unavailable.")

    return AIInsightsResponse(insights=format_ai_insights(raw))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
