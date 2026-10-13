from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    import app.models  # ensure models are registered
    Base.metadata.create_all(bind=engine)
    # Safe migration: ensure user_id column exists in companies table
    try:
        with engine.connect() as conn:
            cursor = conn.connection.cursor()
            cursor.execute("PRAGMA table_info(companies);")
            columns = [row[1] for row in cursor.fetchall()]
            if columns and "user_id" not in columns:
                cursor.execute("ALTER TABLE companies ADD COLUMN user_id INTEGER REFERENCES users(id);")
                conn.connection.commit()
    except Exception as err:
        import logging
        logging.getLogger("ffd.backend").error(f"Schema check error: {err}", exc_info=True)

