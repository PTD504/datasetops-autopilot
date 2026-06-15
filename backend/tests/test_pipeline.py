from backend.pipeline.parser import DocumentParser
from backend.pipeline.chunker import DocumentChunker

def test_pipeline():
    parser = DocumentParser()
    content = "This is some test content.\n\n\n\nIt has extra spaces  and newlines."
    parsed = parser.parse("test.txt", content)
    assert "  " not in parsed
    assert "\n\n\n" not in parsed

    chunker = DocumentChunker(chunk_size=20, overlap=5)
    chunks = chunker.chunk("doc1", "This is a very long string that should be broken up into multiple chunks.")
    assert len(chunks) > 1
    assert chunks[0]["id"] == "doc1_chunk_0000"
    assert chunks[1]["id"] == "doc1_chunk_0001"
    print("Pipeline tests passed")

if __name__ == "__main__":
    test_pipeline()
