from sqlalchemy.orm import Session
from backend.models import Project
from backend.models.enums import WorkflowState
from backend.services.workflow_logger import log_workflow_event

def transition_to(db: Session, project: Project, state: WorkflowState, log_message: str = None, event_type: str = None):
    """Transition the project to a new WorkflowState, clear or set errors, and log a workflow event.

    Does not call db.commit() internally to preserve transaction boundaries.
    """
    project.workflow_state = state.value
    if state == WorkflowState.FAILED and log_message:
        project.last_error = log_message
    else:
        project.last_error = None
    
    if log_message:
        log_workflow_event(db, project.id, event_type or state.value.lower(), log_message)
