from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings


PROJECT_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = "Bakery POS API"
    debug: bool = Field(default=False, validation_alias="BAKERY_DEBUG")
    database_url: str

    model_config = {"env_file": PROJECT_ROOT / ".env"}


settings = Settings()
