from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_ENV: str = "development"
    DATABASE_URL: str
    SECRET_KEY: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()  # type: ignore
