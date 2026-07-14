from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings
import traceback



engine = create_engine(
    settings.DATABASE_URL,
    # connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def ensure_project_cancel_columns():
    inspector = inspect(engine)
    try:
        columns = {column["name"] for column in inspector.get_columns("projects")}
        additions = []
        if "cancel_requested" not in columns:
            additions.append(("cancel_requested", "BOOLEAN NOT NULL DEFAULT FALSE"))
        if "cancel_reason" not in columns:
            additions.append(("cancel_reason", "TEXT NULL"))
        if "cancel_requested_at" not in columns:
            additions.append(("cancel_requested_at", "TIMESTAMP NULL"))
        if "last_error" not in columns:
            additions.append(("last_error", "TEXT NULL"))
        if "doc_understanding" not in columns:
            additions.append(("doc_understanding", "JSON NULL"))

        if additions:
            with engine.begin() as connection:
                for column_name, column_type in additions:
                    connection.execute(text(f"ALTER TABLE projects ADD COLUMN {column_name} {column_type}"))
    except Exception as e:
        print(f"Error checking/adding project cancel columns: {e}")
        print(traceback.format_exc())

    try:
        sample_columns = {column["name"] for column in inspector.get_columns("samples")}
        if "sample_type" not in sample_columns:
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE samples ADD COLUMN sample_type VARCHAR DEFAULT 'single_hop'"))
    except Exception as e:
        print(f"Error checking/adding sample columns: {e}")
        print(traceback.format_exc())

    try:
        if inspector.has_table("evaluations"):
            eval_columns = {column["name"] for column in inspector.get_columns("evaluations")}
            if "novelty_score" not in eval_columns:
                with engine.begin() as connection:
                    connection.execute(text("ALTER TABLE evaluations ADD COLUMN novelty_score FLOAT NULL"))
    except Exception as e:
        print(f"Error checking/adding evaluations columns: {e}")
        print(traceback.format_exc())

def get_db():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def _ensure_pgvector_column():
    """Enable pgvector extension and add embedding_vector column to chunks table.

    Both statements are PostgreSQL-specific. SQLite ignores them silently through
    the try/except blocks so that unit tests remain unaffected.
    """
    try:
        with engine.begin() as connection:
            connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    except Exception as e:
        print(f"Could not enable pgvector extension (expected on SQLite): {e}")
        print(traceback.format_exc())

    try:
        with engine.begin() as connection:
            connection.execute(
                text(f"ALTER TABLE chunks ADD COLUMN IF NOT EXISTS embedding_vector vector({settings.QWEN_EMBEDDING_DIM})")
            )
            try:
                connection.execute(
                    text(f"ALTER TABLE chunks ALTER COLUMN embedding_vector TYPE vector({settings.QWEN_EMBEDDING_DIM})")
                )
            except Exception:
                pass
    except Exception as e:
        print(f"Could not add embedding_vector column (expected on SQLite or if already exists): {e}")
        print(traceback.format_exc())

    try:
        with engine.connect() as conn:
            conn = conn.execution_options(isolation_level="AUTOCOMMIT")
            conn.execute(text(
                "ALTER TYPE workflowstate ADD VALUE IF NOT EXISTS 'EMBEDDING' "
                "BEFORE 'SOURCE_ANALYZING'"
            ))
            try:
                conn.commit()
            except Exception:
                pass
    except Exception as e:
        print(f"Could not alter workflowstate enum (expected on SQLite): {e}")
        print(traceback.format_exc())

# Automatically run schema migrations on import
try:
    ensure_project_cancel_columns()
except Exception as e:
    print(f"Error automatically running ensure_project_cancel_columns: {e}")
    print(traceback.format_exc())

try:
    _ensure_pgvector_column()
except Exception as e:
    print(f"Error automatically running _ensure_pgvector_column: {e}")
    print(traceback.format_exc())
