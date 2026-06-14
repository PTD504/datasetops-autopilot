import contextlib
import datetime
import logging
import uuid
from contextvars import ContextVar
from sqlalchemy.orm import Session
from backend.models.logging_models import AgentRun, ToolCallLog, WorkflowEvent

logger = logging.getLogger(__name__)

# Context variable to track the current agent run ID in the execution thread
current_agent_run_id: ContextVar[str | None] = ContextVar("current_agent_run_id", default=None)

def log_workflow_event(db: Session, project_id: str, event_type: str, message: str, metadata: dict = None):
    try:
        event = WorkflowEvent(
            id=str(uuid.uuid4()),
            project_id=project_id,
            event_type=event_type,
            message=message,
            event_metadata=metadata
        )
        db.add(event)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to log workflow event {event_type} for project {project_id}: {e}")

class AgentRunLogger:
    def __init__(self, run_id: str, db: Session, project_id: str):
        self.run_id = run_id
        self.db = db
        self.project_id = project_id
        self.decision_summary = None
        self.output_json = None
        self.warnings = None
        self.confidence_score = None

    def update(self, decision_summary: str = None, output_json: dict = None, warnings: dict | list | str = None, confidence_score: float = None):
        if decision_summary is not None:
            self.decision_summary = decision_summary
        if output_json is not None:
            self.output_json = output_json
        if warnings is not None:
            self.warnings = warnings
        if confidence_score is not None:
            self.confidence_score = confidence_score

    def log_tool_call(self, tool_name: str, input_summary: str, output_summary: str, status: str, latency_ms: int):
        try:
            tool_call = ToolCallLog(
                id=str(uuid.uuid4()),
                project_id=self.project_id,
                agent_run_id=self.run_id,
                tool_name=tool_name,
                input_summary=input_summary,
                output_summary=output_summary,
                status=status,
                latency_ms=latency_ms
            )
            self.db.add(tool_call)
            self.db.commit()
        except Exception as e:
            logger.error(f"Failed to log tool call {tool_name} for agent run {self.run_id}: {e}")

@contextlib.contextmanager
def log_agent_run(db: Session, project_id: str, agent_name: str, input_summary: str = None):
    run_id = str(uuid.uuid4())
    token = current_agent_run_id.set(run_id)
    
    agent_run = None
    try:
        agent_run = AgentRun(
            id=run_id,
            project_id=project_id,
            agent_name=agent_name,
            status="running",
            input_summary=input_summary,
            started_at=datetime.datetime.utcnow()
        )
        db.add(agent_run)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to initialize agent run logging for {agent_name}: {e}")

    run_logger = AgentRunLogger(run_id, db, project_id)
    
    try:
        yield run_logger
        
        # Success completion
        if agent_run:
            try:
                agent_run.status = "completed"
                agent_run.completed_at = datetime.datetime.utcnow()
                agent_run.decision_summary = run_logger.decision_summary
                agent_run.output_json = run_logger.output_json
                agent_run.warnings = run_logger.warnings
                agent_run.confidence_score = run_logger.confidence_score
                db.commit()
            except Exception as e:
                logger.error(f"Failed to finalize agent run logging for {agent_name}: {e}")
    except Exception as e:
        # Failure completion
        if agent_run:
            try:
                agent_run.status = "failed"
                agent_run.completed_at = datetime.datetime.utcnow()
                agent_run.warnings = {"error": str(e)}
                db.commit()
            except Exception as db_err:
                logger.error(f"Failed to set agent run failure for {agent_name}: {db_err}")
        raise e
    finally:
        current_agent_run_id.reset(token)

def log_tool_call(db: Session, project_id: str, tool_name: str, input_summary: str, output_summary: str, status: str, latency_ms: int):
    """
    Helper to log a tool call using the current active agent run ID from the context variable if present,
    otherwise logging it with agent_run_id=None.
    """
    run_id = current_agent_run_id.get()
    try:
        tool_call = ToolCallLog(
            id=str(uuid.uuid4()),
            project_id=project_id,
            agent_run_id=run_id,
            tool_name=tool_name,
            input_summary=input_summary,
            output_summary=output_summary,
            status=status,
            latency_ms=latency_ms
        )
        db.add(tool_call)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to log tool call {tool_name} for project {project_id}: {e}")
