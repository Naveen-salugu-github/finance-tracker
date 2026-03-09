from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Dict, List
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
        "You are a personal finance assistant. Analyze the following financial data "
        "and give 3 short insights that help the user improve spending habits.\n"
        f"Income: {income}\n"
        f"Expenses:\n{expense_lines}\n"
        "Return clear bullet points."
    )

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
    ai_model_endpoint = os.environ.get("AI_MODEL_ENDPOINT")
    if not ai_model_endpoint:
        raise HTTPException(status_code=503, detail="AI insights unavailable.")

    prompt = build_ai_insights_prompt(input.income, input.expenses)
    payload = {
        "model": "deepseek-r1:latest",
        "prompt": prompt,
        "stream": False,
    }

    try:
        response = await asyncio.to_thread(
            requests.post,
            ai_model_endpoint,
            json=payload,
            timeout=30,
        )
        response.raise_for_status()
        result = response.json()
    except requests.RequestException as exc:
        logger.exception("Failed to fetch AI insights: %s", exc)
        raise HTTPException(status_code=502, detail="AI insights unavailable.") from exc
    except ValueError as exc:
        logger.exception("Invalid AI response payload: %s", exc)
        raise HTTPException(status_code=502, detail="AI insights unavailable.") from exc

    insights = result.get("response")
    if not insights or not isinstance(insights, str):
        raise HTTPException(status_code=502, detail="AI insights unavailable.")

    return AIInsightsResponse(insights=insights)

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
