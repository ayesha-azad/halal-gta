"""Environment-backed settings. Secrets never live in source control."""

from __future__ import annotations

import secrets
from typing import Optional, Tuple
from urllib.parse import urlparse

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEV_CORS_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"


def _csv(value: str) -> Tuple[str, ...]:
    return tuple(dict.fromkeys(item.strip() for item in value.split(",") if item.strip()))


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    environment: str = "development"
    docs_enabled: Optional[bool] = None
    allowed_hosts: str = "*"
    tajweed_cors_origins: str = DEV_CORS_ORIGINS

    tajweed_max_upload_bytes: int = Field(15 * 1024 * 1024, ge=1024 * 1024, le=100 * 1024 * 1024)
    tajweed_max_seconds: int = Field(30, ge=1, le=300)
    api_access_key: str = ""

    tajweed_engine: str = "auto"
    tajweed_model: str = ""
    tajweed_device: str = "cpu"
    tajweed_madd_monfasel: int = Field(2, ge=1, le=10)
    tajweed_madd_mottasel: int = Field(4, ge=1, le=10)
    tajweed_madd_waqf: int = Field(4, ge=1, le=10)
    tajweed_madd_aared: int = Field(2, ge=1, le=10)

    prayer_api_base_url: str = ""
    prayer_api_key: str = ""
    prayer_method: int = Field(2, ge=0, le=99)
    prayer_cache_seconds: int = Field(21600, ge=0, le=86400 * 7)
    prayer_upstream_timeout: float = Field(6, ge=1, le=60)

    quran_api_base_url: str = ""
    quran_cache_seconds: int = Field(86400, ge=0, le=86400 * 30)

    session_token_secret: str = ""
    session_token_ttl: int = Field(600, ge=60, le=3600)
    trust_proxy_headers: Optional[bool] = None
    rate_session_per_minute: int = Field(10, ge=1, le=1000)
    rate_prayer_per_minute: int = Field(60, ge=1, le=10000)
    rate_tajweed_per_minute: int = Field(10, ge=1, le=1000)
    rate_tajweed_per_day: int = Field(100, ge=1, le=100000)
    inference_max_concurrency: int = Field(2, ge=1, le=16)
    inference_queue_timeout: float = Field(10, ge=1, le=120)

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def cors_origins(self) -> Tuple[str, ...]:
        return _csv(self.tajweed_cors_origins)

    @property
    def hosts(self) -> Tuple[str, ...]:
        return _csv(self.allowed_hosts)

    @property
    def show_docs(self) -> bool:
        return self.docs_enabled if self.docs_enabled is not None else not self.is_production

    @property
    def use_proxy_headers(self) -> bool:
        return self.trust_proxy_headers if self.trust_proxy_headers is not None else self.is_production

    @model_validator(mode="after")
    def validate_settings(self) -> "Settings":
        if self.tajweed_engine not in {"auto", "demo", "off", "muaalem", "real"}:
            raise ValueError(f"TAJWEED_ENGINE has an unknown value: {self.tajweed_engine!r}")
        if self.tajweed_device not in {"cpu", "cuda", "mps"}:
            raise ValueError(f"TAJWEED_DEVICE has an unknown value: {self.tajweed_device!r}")

        self.allowed_hosts = self.allowed_hosts.strip()
        self.prayer_api_base_url = self.prayer_api_base_url.strip().rstrip("/")
        self.quran_api_base_url = self.quran_api_base_url.strip().rstrip("/")

        if self.is_production:
            origins = self.cors_origins
            hosts = self.hosts
            if not origins or "*" in origins:
                raise ValueError("TAJWEED_CORS_ORIGINS must list explicit origins in production")
            if not hosts or "*" in hosts:
                raise ValueError("ALLOWED_HOSTS must list explicit hosts in production")
            if len(self.session_token_secret) < 32:
                raise ValueError("SESSION_TOKEN_SECRET must be at least 32 characters in production")
            if self.tajweed_engine in {"muaalem", "real"} and not self.tajweed_model:
                raise ValueError("TAJWEED_MODEL must be set for the real engine")
            parsed = urlparse(self.prayer_api_base_url)
            if parsed.scheme != "https" or not parsed.netloc:
                raise ValueError("PRAYER_API_BASE_URL must be a valid HTTPS URL in production")
            if self.quran_api_base_url:
                parsed = urlparse(self.quran_api_base_url)
                if parsed.scheme != "https" or not parsed.netloc:
                    raise ValueError("QURAN_API_BASE_URL must be a valid HTTPS URL in production")
        else:
            if not self.tajweed_cors_origins.strip():
                self.tajweed_cors_origins = DEV_CORS_ORIGINS
            if not self.session_token_secret:
                # Ephemeral dev secret; tokens reset on restart. Production needs a stable one.
                self.session_token_secret = secrets.token_urlsafe(48)
            if self.prayer_api_base_url:
                parsed = urlparse(self.prayer_api_base_url)
                if parsed.scheme not in {"http", "https"} or not parsed.netloc:
                    raise ValueError("PRAYER_API_BASE_URL must be a valid HTTP(S) URL")
            if self.quran_api_base_url:
                parsed = urlparse(self.quran_api_base_url)
                if parsed.scheme not in {"http", "https"} or not parsed.netloc:
                    raise ValueError("QURAN_API_BASE_URL must be a valid HTTP(S) URL")

        minimum_key_length = 32 if self.is_production else 16
        if self.api_access_key and len(self.api_access_key) < minimum_key_length:
            raise ValueError(f"API_ACCESS_KEY must be at least {minimum_key_length} characters")
        return self


settings = Settings()
