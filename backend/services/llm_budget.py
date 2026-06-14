from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.models.usage import LLMUsageRecord
from backend.core.config import settings
from backend.services.errors import sanitize_error_message
import logging

logger = logging.getLogger(__name__)

class RunBudgetPolicy(BaseModel):
    max_calls: int = settings.max_llm_calls_limit
    max_input_tokens: int = settings.QWEN_MAX_INPUT_TOKENS_PER_RUN
    max_output_tokens: int = settings.QWEN_MAX_OUTPUT_TOKENS_PER_RUN
    max_total_tokens: int = settings.QWEN_MAX_TOTAL_TOKENS_PER_RUN
    max_cost_usd: float = settings.QWEN_MAX_ESTIMATED_COST_USD_PER_RUN

class RunUsageSummary(BaseModel):
    attempted_calls: int = 0
    calls_used: int = 0
    failed_calls: int = 0
    blocked_calls: int = 0
    input_tokens_used: int = 0
    output_tokens_used: int = 0
    total_tokens_used: int = 0
    estimated_cost_used: float = 0.0

class BudgetExceededError(Exception):
    pass

class LLMBudgetGuard:
    def __init__(self, db: Session, project_id: str):
        self.db = db
        self.project_id = project_id
        self.policy = RunBudgetPolicy()
        self.enabled = settings.QWEN_GUARDRAILS_ENABLED

    def get_summary(self) -> RunUsageSummary:
        records = self.db.query(LLMUsageRecord).filter(
            LLMUsageRecord.project_id == self.project_id
        ).all()
        success_records = [record for record in records if record.status == "success"]

        summary = RunUsageSummary()
        summary.attempted_calls = len(records)
        summary.calls_used = len(success_records)
        summary.failed_calls = sum(1 for record in records if record.status == "error")
        summary.blocked_calls = sum(1 for record in records if record.status == "blocked")
        summary.input_tokens_used = sum(r.input_tokens for r in success_records)
        summary.output_tokens_used = sum(r.output_tokens for r in success_records)
        summary.total_tokens_used = sum(r.total_tokens for r in success_records)
        summary.estimated_cost_used = sum(r.estimated_cost_usd for r in success_records)
        return summary

    def check_budget(self, estimated_input_tokens: int = 0):
        if not self.enabled or settings.effective_mock_llm:
            return

        summary = self.get_summary()

        if summary.calls_used >= self.policy.max_calls:
            raise BudgetExceededError(f"Budget exceeded: Max calls ({self.policy.max_calls}) reached.")

        if summary.input_tokens_used + estimated_input_tokens > self.policy.max_input_tokens:
            raise BudgetExceededError(f"Budget exceeded: Projected input tokens exceed limit ({self.policy.max_input_tokens}).")

        if summary.total_tokens_used > self.policy.max_total_tokens:
            raise BudgetExceededError(f"Budget exceeded: Max total tokens ({self.policy.max_total_tokens}) reached.")

        if summary.estimated_cost_used > self.policy.max_cost_usd:
             raise BudgetExceededError(f"Budget exceeded: Max cost (${self.policy.max_cost_usd}) reached.")

    def record_usage(self, agent_name: str, model: str, input_tokens: int, output_tokens: int, status: str = "success", error_message: str = None):
        total_tokens = input_tokens + output_tokens

        # Rough cost estimation (Qwen-plus approx $0.0005 per 1k input, $0.0015 per 1k output)
        cost_usd = 0.0
        if "qwen-plus" in model:
            cost_usd = (input_tokens / 1000.0 * 0.0005) + (output_tokens / 1000.0 * 0.0015)
        elif "qwen-turbo" in model:
            cost_usd = (input_tokens / 1000.0 * 0.0002) + (output_tokens / 1000.0 * 0.0006)

        record = LLMUsageRecord(
            project_id=self.project_id,
            run_mode=settings.RUN_MODE,
            agent_name=agent_name,
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            estimated_cost_usd=cost_usd,
            status=status,
            error_message=sanitize_error_message(error_message) if error_message else None
        )
        self.db.add(record)
        self.db.commit()

        logger.info(f"Recorded usage for {agent_name} ({model}): {total_tokens} tokens, cost: ${cost_usd:.4f}")
