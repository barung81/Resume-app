import pdfplumber
import mammoth
from docx import Document
from io import BytesIO
from fastapi import UploadFile
import re


async def parse_file(file: UploadFile) -> tuple:
    """Parse uploaded file (PDF or DOCX) and return (text, html)."""
    content = await file.read()
    filename = file.filename.lower() if file.filename else ""

    if filename.endswith(".pdf"):
        text = parse_pdf(content)
        # Convert plain text to simple HTML for the editor
        html = "".join([f"<p>{line}</p>" for line in text.split("\n\n") if line.strip()])
        return text, html
    elif filename.endswith(".docx"):
        return parse_docx(content)
    else:
        raise ValueError(f"Unsupported file format: {filename}. Please upload a PDF or DOCX file.")


def parse_pdf(content: bytes) -> str:
    """Extract text from PDF bytes."""
    text_parts = []
    with pdfplumber.open(BytesIO(content)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n\n".join(text_parts)


def parse_docx(content: bytes) -> tuple:
    """Extract text and HTML from DOCX bytes."""
    buffer = BytesIO(content)
    
    # Get HTML using mammoth (much better for structure preservation)
    result = mammoth.convert_to_html(buffer)
    html = result.value
    
    # Get plain text for analysis
    buffer.seek(0)
    doc = Document(buffer)
    text_parts = [p.text for p in doc.paragraphs if p.text.strip()]
    text = "\n\n".join(text_parts)
    
    return text, html
