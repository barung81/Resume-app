from fastapi import APIRouter, UploadFile, File, Form, Response, HTTPException
from api.services.parser import parse_file
from api.services.llm import analyze_resume, suggest_keyword_placement
from api.services.exporter import export_pdf, export_docx
from api.models.schemas import ExportRequest, KeywordApplyRequest

router = APIRouter(prefix="/api", tags=["resume"])


@router.post("/analyze")
async def analyze(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
):
    """Upload resume + job description, get ATS analysis."""
    try:
        # Parse the resume file
        resume_text = await parse_file(resume)

        if not resume_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the uploaded file. Please ensure it contains readable text.",
            )

        # Analyze with LLM
        result = await analyze_resume(resume_text, job_description)
        result["resume_text"] = resume_text

        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/apply-keywords")
async def apply_keywords(request: KeywordApplyRequest):
    """Apply confirmed keywords to resume using LLM."""
    try:
        modified_html = await suggest_keyword_placement(
            request.resume_html, request.keywords
        )

        # Clean up any markdown fences from the response
        if modified_html.startswith("```"):
            lines = modified_html.split("\n")
            modified_html = "\n".join(lines[1:-1])

        return {"modified_html": modified_html}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Keyword application failed: {str(e)}"
        )


@router.post("/export/pdf")
async def export_resume_pdf(request: ExportRequest):
    """Export resume HTML as PDF."""
    try:
        pdf_bytes = export_pdf(request.html_content)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{request.filename}.pdf"'
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF export failed: {str(e)}")


@router.post("/export/docx")
async def export_resume_docx(request: ExportRequest):
    """Export resume HTML as DOCX."""
    try:
        docx_bytes = export_docx(request.html_content)
        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="{request.filename}.docx"'
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DOCX export failed: {str(e)}")
