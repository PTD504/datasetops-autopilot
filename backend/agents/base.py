from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.wrappers.qwen_client import QwenClient
from backend.models import Trace
import logging

logger = logging.getLogger(__name__)

class BaseAgent:
    def __init__(self, db: Session, project_id: str, model: Optional[str] = None):
        self.db = db
        self.project_id = project_id
        self.name = self.__class__.__name__
        self.llm = QwenClient(project_id=self.project_id, agent_name=self.name, db=self.db, model=model)

    def _log_trace(self, action: str, details: Dict[str, Any]):
        trace = Trace(
            project_id=self.project_id,
            agent_name=self.name,
            action=action,
            details=details
        )
        self.db.add(trace)
        self.db.commit()
        logger.info(f"[{self.name}] {action}")
