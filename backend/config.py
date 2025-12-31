from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    app_env: str = "development"
    port: int = 8000
    mongodb_uri: str
    jwt_secret: str
    jwt_expires_in: int = 86400
    cors_origins: str = "http://localhost:3000"
    upload_dir: str = "./uploads"
    max_file_size: int = 10485760  # 10MB in bytes
    openai_api_key: str = ""  # OpenAI API key for chatbot
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]


# Global settings instance
settings = Settings()