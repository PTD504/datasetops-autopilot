from typing import List, Dict

class DocumentChunker:
    def __init__(self, chunk_size: int = 1000, overlap: int = 100):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk(self, doc_id: str, text: str) -> List[Dict]:
        """
        Naive character-based chunker with overlap.
        """
        chunks = []
        if not text:
            return chunks

        start = 0
        text_len = len(text)
        index = 0

        while start < text_len:
            end = min(start + self.chunk_size, text_len)

            # If not at the end, try to find a natural break point (newline or period)
            if end < text_len:
                # Look back for a period or newline within the last 100 chars
                lookback = min(100, self.chunk_size)
                break_point = -1

                for char in ['\n\n', '\n', '. ']:
                    pos = text.rfind(char, start + self.chunk_size - lookback, end)
                    if pos != -1:
                        break_point = pos + len(char)
                        break

                if break_point != -1:
                    end = break_point

            chunk_text = text[start:end].strip()
            if chunk_text:
                chunk_id = f"{doc_id}_chunk_{index:04d}"
                chunks.append({
                    "id": chunk_id,
                    "document_id": doc_id,
                    "text": chunk_text,
                    "index": index
                })
                index += 1

            start = end - self.overlap

            if start >= text_len or end >= text_len:
                break

        return chunks
