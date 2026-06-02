from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from backend.core.database import get_db, SessionLocal
from backend.models import Project, Document, BenchmarkPlan, Sample
from pydantic import BaseModel
import os

from backend.pipeline.parser import DocumentParser
from backend.pipeline.chunker import DocumentChunker
from backend.agents.intake_planner import IntakePlannerAgent
from backend.agents.source_understanding import SourceUnderstandingAgent
from backend.agents.generator import BenchmarkGeneratorAgent
from backend.agents.evaluator import QualityEvaluatorAgent
from backend.agents.exporter import ExportReportAgent

router = APIRouter()

class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    benchmark_request: str

class ProjectResponse(BaseModel):
    id: str
    name: str
    workflow_state: str

    class Config:
        from_attributes = True

@router.post("/", response_model=ProjectResponse)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    db_project = Project(
        name=project.name,
        description=project.description,
        benchmark_request=project.benchmark_request
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/{project_id}/documents")
async def upload_document(project_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    content = await file.read()
    text_content = content.decode('utf-8', errors='ignore')

    # Store locally for fallback
    os.makedirs(f"backend/uploads/{project_id}", exist_ok=True)
    file_path = f"backend/uploads/{project_id}/{file.filename}"
    with open(file_path, "wb") as f:
        f.write(content)

    parser = DocumentParser()
    cleaned_content = parser.parse(file.filename, text_content)

    db_doc = Document(
        project_id=project_id,
        filename=file.filename,
        file_path=file_path,
        content=cleaned_content
    )
    db.add(db_doc)

    project.workflow_state = "FILES_UPLOADED"
    db.commit()
    db.refresh(db_doc)
    return {"id": db_doc.id, "filename": db_doc.filename}

@router.get("/{project_id}/documents")
def list_documents(project_id: str, db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.project_id == project_id).all()
    return [{"id": d.id, "filename": d.filename, "status": d.status} for d in docs]

def _run_initial_workflow(project_id: str):
    db = SessionLocal()
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return

        # 1. Chunking
        project.workflow_state = "CHUNKING"
        db.commit()

        chunker = DocumentChunker()
        docs = db.query(Document).filter(Document.project_id == project_id).all()
        for doc in docs:
             chunks = chunker.chunk(doc.id, doc.content)
             from backend.models import Chunk
             for c_data in chunks:
                 new_chunk = Chunk(**c_data, project_id=project_id)
                 db.add(new_chunk)
             doc.status = "CHUNKED"
        db.commit()

        project.workflow_state = "CHUNKED"
        db.commit()

        # 2. Source Analyzing
        project.workflow_state = "SOURCE_ANALYZING"
        db.commit()

        source_agent = SourceUnderstandingAgent(db, project_id)
        summary, warnings = source_agent.run()

        project.workflow_state = "SOURCE_ANALYZED"
        db.commit()

        # 3. Planning
        project.workflow_state = "PLANNING"
        db.commit()

        planner_agent = IntakePlannerAgent(db, project_id)
        planner_agent.run(project.benchmark_request, summary, warnings)

        project.workflow_state = "WAITING_FOR_PLAN_APPROVAL"
        db.commit()
    except Exception as e:
        print(f"Error in initial workflow: {e}")
        project.workflow_state = "FAILED"
        db.commit()
    finally:
        db.close()


@router.post("/{project_id}/start")
def start_workflow(project_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.workflow_state = "PARSING"
    db.commit()

    background_tasks.add_task(_run_initial_workflow, project_id)
    return {"status": "started"}

@router.get("/{project_id}/status")
def get_project_status(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"workflow_state": project.workflow_state}

@router.get("/{project_id}/plan")
def get_plan(project_id: str, db: Session = Depends(get_db)):
    plan = db.query(BenchmarkPlan).filter(BenchmarkPlan.project_id == project_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

def _run_generation_workflow(project_id: str):
    db = SessionLocal()
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        plan = db.query(BenchmarkPlan).filter(BenchmarkPlan.project_id == project_id).first()
        if not project or not plan:
            return

        project.workflow_state = "GENERATING"
        db.commit()

        generator = BenchmarkGeneratorAgent(db, project_id)
        evaluator = QualityEvaluatorAgent(db, project_id)

        # Determine total sample count to generate
        total_samples = 10
        if plan.sample_count and isinstance(plan.sample_count, dict):
            total_samples = plan.sample_count.get("total", 10)

        samples = generator.generate(plan, total_samples)

        project.workflow_state = "EVALUATING"
        db.commit()

        # Evaluate and trigger repair loop
        for sample in samples:
             eval_result, needs_repair = evaluator.evaluate(sample)

             if needs_repair and sample.retry_count < 2:
                 sample.retry_count += 1
                 db.commit()
                 # Send back for repair
                 generator.generate(plan, 1, mode="repair", sample=sample)
                 # Re-evaluate
                 evaluator.evaluate(sample)

        project.workflow_state = "WAITING_FOR_SAMPLE_REVIEW"
        db.commit()

        # For hackathon demo speed, immediately export if some samples are approved
        exporter = ExportReportAgent(db, project_id)
        exporter.run()

    except Exception as e:
        print(f"Error in generation workflow: {e}")
        project.workflow_state = "FAILED"
        db.commit()
    finally:
        db.close()


@router.post("/{project_id}/plan/approve")
def approve_plan(project_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.workflow_state = "PLAN_APPROVED"
    db.commit()

    background_tasks.add_task(_run_generation_workflow, project_id)
    return {"status": "approved"}

@router.get("/{project_id}/samples")
def get_samples(project_id: str, status: str = None, db: Session = Depends(get_db)):
    query = db.query(Sample).filter(Sample.project_id == project_id)
    if status:
        query = query.filter(Sample.status == status)
    return query.all()
