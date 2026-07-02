import re
from typing import Dict, Any

class DocumentParser:
    def __init__(self):
        pass

    def parse(self, filename: str, content: Any) -> str:
        """
        Parses TXT, Markdown, and PDF files.
        For PDF files, it extracts text using pdfplumber.
        For other files, it cleans up extra whitespace.
        """
        if not content:
            return ""

        if isinstance(content, bytes) and filename.lower().endswith('.pdf'):
            try:
                import pdfplumber
                import io
                text_content = ""
                with pdfplumber.open(io.BytesIO(content)) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text_content += page_text + "\n"
                
                # Check if all pages returned empty text after extraction
                if not text_content.strip():
                    raise ValueError("PDF appears to be image-only or empty — no extractable text found")
            except ValueError as e:
                raise e
            except Exception as e:
                raise ValueError(f"Failed to parse PDF document: {str(e)}") from e
        else:
            if isinstance(content, bytes):
                text_content = content.decode('utf-8', errors='ignore')
            else:
                text_content = content

        # Basic cleanup: remove multiple consecutive newlines and spaces
        cleaned = re.sub(r'\n{3,}', '\n\n', text_content)
        cleaned = re.sub(r' {2,}', ' ', cleaned)
        return cleaned.strip()

