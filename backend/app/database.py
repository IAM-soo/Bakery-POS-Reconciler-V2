from sqlmodel import Session, SQLModel, create_engine

from app.config import settings


engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_db():
    with Session(engine) as session:
        yield session