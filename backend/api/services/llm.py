import json
import google.generativeai as genai
import os


def get_model():
    """Initialize and return Gemini model."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-flash-latest")


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


async def suggest_keyword_placement(resume_content: str, keywords: list, source_type: str = "docx") -> str:
    """
    Use LLM to intelligently place keywords into the resume content.
    Adapts strategy based on source_type (pdf reconstruction vs docx preservation).
    """
    model = get_model()

    if source_type == "pdf":
        # Strategy for PDFs: Reconstruction into professional HTML
        prompt = f"""You are an expert resume writer. 

The following text was extracted from a PDF. It has lost its original formatting.
Your task is to RECONSTRUCT this into a professional, high-fidelity resume HTML format while incorporating the provided keywords.

RESUME TEXT:
---
{resume_content}
---

KEYWORDS TO ADD:
{', '.join(keywords)}

Rules:
1. Reconstruct the resume into a clean, modern HTML structure.
2. Use <h1> for the name, <h2> for section headers (Skills, Experience, Education).
3. Use <ul> and <li> for bullet points.
4. Incorporate the keywords NATURALLY into relevant sections. Do not just list them at the end.
5. Ensure the name is centered if possible (using style="text-align: center").
6. The output must be valid HTML.
7. Return ONLY the HTML, no code fences or explanations."""
    else:
        # Strategy for DOCX: Preservation of high-fidelity Mammoth HTML
        prompt = f"""You are an expert resume writer. 

Given the following HTML resume and a list of keywords to add, modify the content to naturally incorporate these keywords while STRICTLY PRESERVING the original structure and formatting.

RESUME HTML:
---
{resume_content}
---

KEYWORDS TO ADD:
{', '.join(keywords)}

Rules:
1. Return the SAME HTML structure with the keywords added. 
2. Do NOT remove any existing tags, styles, or classes.
3. Add keywords naturally into existing bullet points, skill sections, or experience descriptions.
4. Focus on maintaining the exact layout provided.
5. Return ONLY the modified HTML, no explanations or code fences."""

    response = model.generate_content(prompt)
    return response.text.strip()
