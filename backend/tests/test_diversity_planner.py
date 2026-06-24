import uuid
from backend.core.database import SessionLocal, engine, Base
from backend.models import Project, BenchmarkPlan
from backend.tools.diversity_planner import DiversityPlannerTool

class MockRetriever:
    def __init__(self, chunks):
        self.chunks = chunks
        self.calls = []

    def retrieve(self, project_id, query, top_k=5):
        self.calls.append((project_id, query, top_k))
        return self.chunks

def test_diversity_planner_basic():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    project_id = str(uuid.uuid4())
    project = Project(id=project_id, name="Test Diversity Project", benchmark_request="Test")
    db.add(project)

    plan = BenchmarkPlan(
        project_id=project_id,
        goal="Test plan",
        language="English",
        categories=["refund", "shipping", "warranty"],
        sample_count={"total": 6, "easy": 2, "medium": 2, "hard": 2}
    )
    db.add(plan)
    db.commit()

    # Create a mock source report
    source_report = {
        "coverage_by_category": {
            "refund": {
                "coverage_level": "strong",
                "coverage_score": 0.9,
                "matching_chunk_ids": ["refund_c1", "refund_c2"]
            },
            "shipping": {
                "coverage_level": "weak",
                "coverage_score": 0.3,
                "matching_chunk_ids": ["shipping_c1"]
            },
            "warranty": {
                "coverage_level": "unsupported",
                "coverage_score": 0.0,
                "matching_chunk_ids": []
            }
        }
    }

    planner = DiversityPlannerTool(db, project_id)
    result = planner.plan_slots(plan, source_report, count=6)

    assert "slots" in result
    assert "summary" in result
    slots = result["slots"]
    summary = result["summary"]

    assert len(slots) == 6
    assert summary["total_slots"] == 6

    # Verify deterministic category rotation (sorted: refund (strong) -> shipping (weak) -> warranty (unsupported))
    # refund, shipping, warranty, refund, shipping, warranty
    assert slots[0]["category"] == "refund"
    assert slots[1]["category"] == "shipping"
    assert slots[2]["category"] == "warranty"
    assert slots[3]["category"] == "refund"
    assert slots[4]["category"] == "shipping"
    assert slots[5]["category"] == "warranty"

    # Verify deterministic difficulty matching: easy, easy, medium, medium, hard, hard
    assert slots[0]["difficulty"] == "easy"
    assert slots[1]["difficulty"] == "easy"
    assert slots[2]["difficulty"] == "medium"
    assert slots[3]["difficulty"] == "medium"
    assert slots[4]["difficulty"] == "hard"
    assert slots[5]["difficulty"] == "hard"

    # Verify sample types rotation: single_hop, multi_hop, unanswerable, edge_case, single_hop, multi_hop
    assert slots[0]["sample_type"] == "single_hop"
    assert slots[1]["sample_type"] == "multi_hop"
    assert slots[2]["sample_type"] == "unanswerable"
    assert slots[3]["sample_type"] == "edge_case"
    assert slots[4]["sample_type"] == "single_hop"
    assert slots[5]["sample_type"] == "multi_hop"

    # Verify notes/warnings for weak/unsupported categories
    # slot 0 category is refund (strong) -> notes empty
    assert len(slots[0]["notes"]) == 0
    # slot 1 category is shipping (weak) -> note warning present
    assert len(slots[1]["notes"]) == 1
    assert "weak coverage" in slots[1]["notes"][0]
    # slot 2 category is warranty (unsupported) -> note warning present
    assert len(slots[2]["notes"]) == 1
    assert "unsupported by source" in slots[2]["notes"][0]

    # Check unanswerable has required_evidence_count = 1
    assert slots[2]["sample_type"] == "unanswerable"
    assert slots[2]["required_evidence_count"] == 1

    # Check preferred_chunk_ids rotation
    assert slots[0]["preferred_chunk_ids"] == ["refund_c1"]
    assert slots[3]["preferred_chunk_ids"] == ["refund_c2"] # slot 3 uses chunk 2 due to index modulo

    db.close()

def test_diversity_planner_fallback():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    project_id = str(uuid.uuid4())
    project = Project(id=project_id, name="Test Fallback", benchmark_request="Test")
    db.add(project)

    plan = BenchmarkPlan(
        project_id=project_id,
        goal="Test plan",
        language="English",
        categories=["refund"],
        sample_count={"total": 2, "easy": 1, "medium": 1, "hard": 0}
    )
    db.add(plan)
    db.commit()

    # Pass empty source report but mock retriever
    mock_chunks = [{"id": "fallback_chunk_99", "text": "mock context info"}]
    retriever = MockRetriever(mock_chunks)

    planner = DiversityPlannerTool(db, project_id, retriever=retriever)
    result = planner.plan_slots(plan, source_report=None, count=2)

    slots = result["slots"]
    assert len(slots) == 2
    assert slots[0]["preferred_chunk_ids"] == ["fallback_chunk_99"]
    assert len(retriever.calls) == 1 # called retrieve fallback

    db.close()
