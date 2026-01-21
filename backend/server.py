from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)

# Models
class CodeSubmission(BaseModel):
    code: str
    language: str
    filename: Optional[str] = None

class IssueDetail(BaseModel):
    severity: str
    line: Optional[int] = None
    message: str
    suggestion: str

class AnalysisResult(BaseModel):
    category: str
    score: int
    issues: List[IssueDetail]

class CodeReview(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    language: str
    filename: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "completed"
    overall_score: int = 0
    results: List[AnalysisResult] = []

class CodeReviewResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    language: str
    filename: Optional[str] = None
    timestamp: datetime
    status: str
    overall_score: int
    results: List[AnalysisResult]

# Helper function to analyze code with Gemini
async def analyze_code_with_gemini(code: str, language: str, analysis_type: str) -> Dict[str, Any]:
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY', '')
        if not api_key:
            raise ValueError("EMERGENT_LLM_KEY not found")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"code_review_{uuid.uuid4()}",
            system_message="You are an expert code reviewer. Analyze code and provide structured feedback."
        ).with_model("gemini", "gemini-2.5-flash")
        
        prompts = {
            "code_quality": f"""Analyze this {language} code for code quality issues. Return a JSON with:
- score (0-100)
- issues: array of {{severity: "critical"|"high"|"medium"|"low", line: number|null, message: string, suggestion: string}}

Code:
```{language}
{code}
```

Return ONLY valid JSON, no markdown.""",
            "security": f"""Analyze this {language} code for security vulnerabilities. Return a JSON with:
- score (0-100, higher is more secure)
- issues: array of {{severity: "critical"|"high"|"medium"|"low", line: number|null, message: string, suggestion: string}}

Code:
```{language}
{code}
```

Return ONLY valid JSON, no markdown.""",
            "performance": f"""Analyze this {language} code for performance issues. Return a JSON with:
- score (0-100)
- issues: array of {{severity: "critical"|"high"|"medium"|"low", line: number|null, message: string, suggestion: string}}

Code:
```{language}
{code}
```

Return ONLY valid JSON, no markdown.""",
            "best_practices": f"""Analyze this {language} code for adherence to best practices. Return a JSON with:
- score (0-100)
- issues: array of {{severity: "critical"|"high"|"medium"|"low", line: number|null, message: string, suggestion: string}}

Code:
```{language}
{code}
```

Return ONLY valid JSON, no markdown."""
        }
        
        prompt = prompts.get(analysis_type, prompts["code_quality"])
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Clean response and parse JSON
        response_text = response.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        result = json.loads(response_text)
        return result
    except Exception as e:
        logger.error(f"Error in analyze_code_with_gemini: {str(e)}")
        return {"score": 50, "issues": []}

# API Routes
@api_router.post("/reviews/analyze", response_model=CodeReviewResponse)
async def analyze_code(submission: CodeSubmission):
    try:
        # Run all analysis types
        analysis_types = ["code_quality", "security", "performance", "best_practices"]
        results = []
        total_score = 0
        
        for analysis_type in analysis_types:
            result = await analyze_code_with_gemini(
                submission.code,
                submission.language,
                analysis_type
            )
            
            category_name = analysis_type.replace("_", " ").title()
            analysis_result = AnalysisResult(
                category=category_name,
                score=result.get("score", 50),
                issues=[IssueDetail(**issue) for issue in result.get("issues", [])]
            )
            results.append(analysis_result)
            total_score += result.get("score", 50)
        
        overall_score = total_score // len(analysis_types)
        
        # Create review document
        review = CodeReview(
            code=submission.code,
            language=submission.language,
            filename=submission.filename,
            status="completed",
            overall_score=overall_score,
            results=results
        )
        
        # Save to MongoDB
        doc = review.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.code_reviews.insert_one(doc)
        
        # Return response without code
        return CodeReviewResponse(
            id=review.id,
            language=review.language,
            filename=review.filename,
            timestamp=review.timestamp,
            status=review.status,
            overall_score=review.overall_score,
            results=review.results
        )
    except Exception as e:
        logger.error(f"Error analyzing code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/reviews", response_model=List[CodeReviewResponse])
async def get_reviews():
    try:
        reviews = await db.code_reviews.find({}, {"_id": 0, "code": 0}).sort("timestamp", -1).to_list(100)
        
        for review in reviews:
            if isinstance(review['timestamp'], str):
                review['timestamp'] = datetime.fromisoformat(review['timestamp'])
        
        return reviews
    except Exception as e:
        logger.error(f"Error fetching reviews: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/reviews/{review_id}")
async def get_review(review_id: str):
    try:
        review = await db.code_reviews.find_one({"id": review_id}, {"_id": 0})
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        
        if isinstance(review['timestamp'], str):
            review['timestamp'] = datetime.fromisoformat(review['timestamp'])
        
        return review
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching review: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/reviews/{review_id}")
async def delete_review(review_id: str):
    try:
        result = await db.code_reviews.delete_one({"id": review_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Review not found")
        return {"message": "Review deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting review: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()