from docx import Document
from htmldocx import HtmlToDocx
from io import BytesIO
import re


def export_docx(html_content: str) -> bytes:
    """Convert HTML content to DOCX bytes."""
    doc = Document()

    # Set default font
    style = doc.styles["Normal"]
    font = style.font
    font.name = "Calibri"
    font.size = 110000  # 11pt in EMUs

    # Convert HTML to docx
    parser = HtmlToDocx()
    parser.add_html_to_document(html_content, doc)

    buffer = BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer.read()


def export_pdf(html_content: str) -> bytes:
    """Convert HTML content to PDF bytes using a simple approach."""
    # Build a full HTML document with styling
    full_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page {{
            size: A4;
            margin: 1.5cm;
        }}
        body {{
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #333;
            max-width: 100%;
        }}
        h1 {{
            font-size: 20pt;
            color: #1a1a1a;
            margin-bottom: 4pt;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 4pt;
        }}
        h2 {{
            font-size: 14pt;
            color: #1e40af;
            margin-top: 12pt;
            margin-bottom: 4pt;
            border-bottom: 1px solid #ddd;
            padding-bottom: 2pt;
        }}
        h3 {{
            font-size: 12pt;
            color: #333;
            margin-top: 8pt;
            margin-bottom: 2pt;
        }}
        p {{
            margin: 4pt 0;
        }}
        ul {{
            margin: 4pt 0;
            padding-left: 20pt;
        }}
        li {{
            margin: 2pt 0;
        }}
        strong {{
            color: #1a1a1a;
        }}
        a {{
            color: #2563eb;
            text-decoration: none;
        }}
    </style>
</head>
<body>
    {html_content}
</body>
</html>"""

    try:
        from weasyprint import HTML
        pdf_bytes = HTML(string=full_html).write_pdf()
        return pdf_bytes
    except ImportError:
        # Fallback: use a simpler approach if weasyprint is not available
        # We'll use reportlab as a fallback
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.platypus import SimpleDocTemplate, Paragraph
            from reportlab.lib.styles import getSampleStyleSheet

            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4)
            styles = getSampleStyleSheet()

            # Strip HTML tags for simple text rendering
            clean_text = re.sub(r'<[^>]+>', '\n', html_content)
            paragraphs = [Paragraph(line.strip(), styles['Normal'])
                          for line in clean_text.split('\n') if line.strip()]
            doc.build(paragraphs)
            buffer.seek(0)
            return buffer.read()
        except ImportError:
            raise ImportError(
                "Neither WeasyPrint nor ReportLab is available. "
                "Install one of them: pip install weasyprint OR pip install reportlab"
            )
