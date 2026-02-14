import pdfplumber
from docx import Document
from io import BytesIO
from fastapi import UploadFile


async def parse_file(file: UploadFile) -> str:
    """Parse uploaded file (PDF or DOCX) and return extracted text."""
    content = await file.read()
    filename = file.filename.lower() if file.filename else ""

    if filename.endswith(".pdf"):
        return parse_pdf(content)
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


def parse_docx(content: bytes) -> str:
    """Extract text from DOCX bytes."""
    doc = Document(BytesIO(content))
    text_parts = []
    for paragraph in doc.paragraphs:
        if paragraph.text.strip():
            text_parts.append(paragraph.text)
    return "\n\n".join(text_parts)
