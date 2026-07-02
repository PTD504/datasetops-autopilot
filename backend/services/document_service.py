import os
from pathlib import Path
from sqlalchemy.orm import Session
from backend.models import Document, Project
from backend.core.config import settings
from backend.pipeline.parser import DocumentParser

def process_document_upload(db: Session, project: Project, filename: str, content: bytes) -> Document:
    """Process uploaded file content, store it locally, parse it, and save the document to the database."""
    safe_filename = Path(filename or "upload.txt").name

    # Store locally for fallback
    os.makedirs(os.path.join(settings.UPLOADS_DIR, project.id), exist_ok=True)
    file_path = os.path.join(settings.UPLOADS_DIR, project.id, safe_filename)
    with open(file_path, "wb") as f:
        f.write(content)

    parser = DocumentParser()
    cleaned_content = parser.parse(safe_filename, content)

    db_doc = Document(
        project_id=project.id,
        filename=safe_filename,
        file_path=file_path,
        content=cleaned_content
    )
    db.add(db_doc)

    project.workflow_state = "FILES_UPLOADED"
    project.last_error = None
    
    db.flush()
    return db_doc

def list_project_documents(db: Session, project_id: str):
    """Retrieve and list documents associated with a project."""
    docs = db.query(Document).filter(Document.project_id == project_id).all()
    return [{"id": d.id, "filename": d.filename, "status": d.status} for d in docs]
