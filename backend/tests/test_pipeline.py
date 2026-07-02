from unittest.mock import MagicMock, patch
import pytest
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

def test_pdf_parsing():
    # 1. test_pdf_parsing: PDF bytes valid -> return correct text (mock pdfplumber)
    parser = DocumentParser()
    
    mock_page_1 = MagicMock()
    mock_page_1.extract_text.return_value = "Page 1 content."
    mock_page_2 = MagicMock()
    mock_page_2.extract_text.return_value = "Page 2 content."
    
    mock_pdf = MagicMock()
    mock_pdf.pages = [mock_page_1, mock_page_2]
    
    with patch("pdfplumber.open") as mock_open:
        mock_open.return_value.__enter__.return_value = mock_pdf
        
        pdf_bytes = b"%PDF-1.4 mock binary content"
        parsed = parser.parse("test.pdf", pdf_bytes)
        
        assert "Page 1 content." in parsed
        assert "Page 2 content." in parsed
        mock_open.assert_called_once()

def test_pdf_empty_pages():
    # 2. test_pdf_empty_pages: PDF bytes with all pages empty -> raise ValueError
    parser = DocumentParser()
    
    mock_page = MagicMock()
    mock_page.extract_text.return_value = ""  # empty text
    
    mock_pdf = MagicMock()
    mock_pdf.pages = [mock_page]
    
    with patch("pdfplumber.open") as mock_open:
        mock_open.return_value.__enter__.return_value = mock_pdf
        
        pdf_bytes = b"%PDF-1.4 empty mock binary"
        with pytest.raises(ValueError) as excinfo:
            parser.parse("empty.pdf", pdf_bytes)
        
        assert "PDF appears to be image-only or empty" in str(excinfo.value)
        mock_open.assert_called_once()

def test_pdf_wrong_extension():
    # 3. test_pdf_wrong_extension: bytes valid but filename is .txt -> KHÔNG trigger PDF path, fallback về UTF-8 decode
    parser = DocumentParser()
    
    with patch("pdfplumber.open") as mock_open:
        txt_bytes = "This is a regular text file bytes.".encode('utf-8')
        parsed = parser.parse("test.txt", txt_bytes)
        
        assert parsed == "This is a regular text file bytes."
        mock_open.assert_not_called()

if __name__ == "__main__":
    test_pipeline()
    test_pdf_parsing()
    test_pdf_empty_pages()
    test_pdf_wrong_extension()
    print("All tests ran successfully!")

