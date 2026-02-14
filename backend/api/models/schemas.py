from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class AnalyzeResponse(BaseModel):
    ats_score: int
    matched_keywords: List[str]
    missing_keywords: List[str]
    suggestions: List[str]
    resume_text: str
    job_title: Optional[str] = None


class ExportRequest(BaseModel):
    html_content: str
    filename: Optional[str] = "resume"


class HistoryCreate(BaseModel):
    job_title: Optional[str] = None
    job_description: str
    resume_text: str
    ats_score: int
    matched_keywords: List[str]
    missing_keywords: List[str]
    suggestions: List[str]
    final_resume_html: Optional[str] = None


class HistoryItem(BaseModel):
    id: str
    user_id: str
    job_title: Optional[str] = None
    job_description: str
    resume_text: str
    ats_score: int
    matched_keywords: List[str]
    missing_keywords: List[str]
    suggestions: List[str]
    final_resume_html: Optional[str] = None
    created_at: str


class KeywordApplyRequest(BaseModel):
    resume_html: str
    keywords: List[str]
