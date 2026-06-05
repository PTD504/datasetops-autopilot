from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

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

        if additions:
            with engine.begin() as connection:
                for column_name, column_type in additions:
                    connection.execute(text(f"ALTER TABLE projects ADD COLUMN {column_name} {column_type}"))
    except Exception as e:
        print(f"Error checking/adding project cancel columns: {e}")

    try:
        sample_columns = {column["name"] for column in inspector.get_columns("samples")}
        if "sample_type" not in sample_columns:
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE samples ADD COLUMN sample_type VARCHAR DEFAULT 'single_hop'"))
    except Exception as e:
        print(f"Error checking/adding sample columns: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
