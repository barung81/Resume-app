import json
import google.generativeai as genai
import os


def get_model():
    """Initialize and return Gemini model."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-1.5-flash")


async def analyze_resume(resume_text: str, job_description: str) -> dict:
    """
    Analyze resume against job description using Gemini.
    Returns ATS score, matched/missing keywords, and suggestions.
    """
    model = get_model()

    prompt = f"""You are an expert ATS (Applicant Tracking System) analyzer and career coach.

Analyze the following resume against the job description and provide a detailed ATS compatibility analysis.

RESUME:
---
{resume_text}
---

JOB DESCRIPTION:
---
{job_description}
---

Provide your analysis in the following JSON format ONLY (no markdown, no code fences, just raw JSON):
{{
    "ats_score": <integer 0-100 representing ATS compatibility>,
    "job_title": "<extracted job title from the description>",
    "matched_keywords": ["<keyword1>", "<keyword2>", ...],
    "missing_keywords": ["<keyword1>", "<keyword2>", ...],
    "suggestions": [
        "<actionable suggestion 1>",
        "<actionable suggestion 2>",
        ...
    ]
}}

Rules:
1. The ATS score should reflect how well the resume matches the job description keywords, skills, and requirements.
2. matched_keywords: Skills, technologies, qualifications, and important terms that appear in BOTH the resume and job description.
3. missing_keywords: Critical skills, technologies, qualifications, and terms in the job description that are MISSING from the resume.
4. suggestions: Specific, actionable recommendations to improve the resume for this job. Include where to add missing keywords naturally.
5. Focus on hard skills, technical skills, certifications, tools, and industry-specific terms.
6. Return ONLY valid JSON, no other text."""

    response = model.generate_content(prompt)
    response_text = response.text.strip()

    # Clean up response - remove markdown fences if present
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        response_text = "\n".join(lines[1:-1])

    result = json.loads(response_text)

    return {
        "ats_score": int(result.get("ats_score", 0)),
        "job_title": result.get("job_title", ""),
        "matched_keywords": result.get("matched_keywords", []),
        "missing_keywords": result.get("missing_keywords", []),
        "suggestions": result.get("suggestions", []),
    }


async def suggest_keyword_placement(resume_text: str, keywords: list) -> str:
    """
    Use LLM to intelligently place keywords into the resume text.
    Returns modified resume HTML content.
    """
    model = get_model()

    prompt = f"""You are an expert resume writer. 

Given the following resume text and a list of keywords to add, modify the resume to naturally incorporate these keywords.

RESUME:
---
{resume_text}
---

KEYWORDS TO ADD:
{', '.join(keywords)}

Rules:
1. Add keywords naturally into existing bullet points, skill sections, or experience descriptions.
2. Do NOT fabricate experience — only add keywords where they can reasonably fit based on existing content.
3. If a keyword represents a skill, add it to the skills section.
4. If a keyword represents a responsibility or tool, weave it into relevant experience bullet points.
5. Maintain the original format and structure.
6. Return the modified resume as clean HTML that can be rendered in a rich text editor.
7. Use standard HTML tags: <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>.
8. Return ONLY the HTML content, no explanations or markdown fences."""

    response = model.generate_content(prompt)
    return response.text.strip()
