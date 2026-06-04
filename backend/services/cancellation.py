import datetime
from typing import Optional

from sqlalchemy.orm import Session

from backend.models import Project, Trace


TERMINAL_WORKFLOW_STATES = {"DONE", "FAILED", "EXPORT_READY"}
DEFAULT_CANCEL_REASON = "Workflow stop requested by user."


class WorkflowCancellationRequested(Exception):
    pass


def workflow_state_value(project: Project) -> str:
    state = project.workflow_state
    return getattr(state, "value", str(state))


def is_terminal(project: Project) -> bool:
    return workflow_state_value(project) in TERMINAL_WORKFLOW_STATES


def request_cancellation(
    db: Session,
    project: Project,
    reason: str = DEFAULT_CANCEL_REASON,
) -> dict:
    already_requested = bool(project.cancel_requested)
    terminal = is_terminal(project)

    if not already_requested:
        project.cancel_requested = True
        project.cancel_reason = reason
        project.cancel_requested_at = datetime.datetime.utcnow()
        db.add(
            Trace(
                project_id=project.id,
                agent_name="WorkflowController",
                action="cancel_requested",
                details={"reason": reason, "workflow_state": workflow_state_value(project)},
            )
        )
        db.commit()
        db.refresh(project)

    if terminal:
        message = "Workflow is no longer active; cancellation request recorded."
    elif already_requested:
        message = "Cancellation was already requested for this workflow."
    else:
        message = "Cancellation requested. The workflow will stop before the next guarded step."

    return {
        "project_id": project.id,
        "cancel_requested": True,
        "workflow_state": workflow_state_value(project),
        "cancel_reason": project.cancel_reason,
        "message": message,
    }


def raise_if_cancelled(
    db: Session,
    project_id: str,
    checkpoint: Optional[str] = None,
) -> None:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project or not project.cancel_requested:
        return

    reason = project.cancel_reason or DEFAULT_CANCEL_REASON
    db.add(
        Trace(
            project_id=project_id,
            agent_name="WorkflowController",
            action="workflow_cancelled",
            details={"reason": reason, "checkpoint": checkpoint, "workflow_state": workflow_state_value(project)},
        )
    )
    db.commit()
    raise WorkflowCancellationRequested(reason)
