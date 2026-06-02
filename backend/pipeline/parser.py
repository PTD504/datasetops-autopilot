import re
from typing import Dict, Any

class DocumentParser:
    def __init__(self):
        pass

    def parse(self, filename: str, content: str) -> str:
        """
        Parses TXT and Markdown files.
        For MVP, it mostly cleans up extra whitespace.
        """
        if not content:
            return ""

        # Basic cleanup: remove multiple consecutive newlines and spaces
        cleaned = re.sub(r'\n{3,}', '\n\n', content)
        cleaned = re.sub(r' {2,}', ' ', cleaned)
        return cleaned.strip()
