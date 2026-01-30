# backend/aws/config.py

import os
from dotenv import load_dotenv

# Load .env from backend directory
load_dotenv(".env")

# =========================
# AWS CORE CONFIG
# =========================
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

# =========================
# BEDROCK MODELS (Hackathon-approved)
# =========================
BEDROCK_TEXT_MODEL = "amazon.nova-premier-v1:0"
BEDROCK_EMBED_MODEL = "amazon.titan-embed-text-v2:0"

# =========================
# BEDROCK AGENTS
# =========================
FISHERIES_AGENT_ID = os.getenv("FISHERIES_AGENT_ID")
FISHERIES_AGENT_ALIAS_ID = os.getenv("FISHERIES_AGENT_ALIAS_ID")

OVERFISHING_AGENT_ID = os.getenv("OVERFISHING_AGENT_ID")
OVERFISHING_AGENT_ALIAS_ID = os.getenv("OVERFISHING_AGENT_ALIAS_ID")

# =========================
# SAFETY CHECK (for judges + debugging)
# =========================
def validate_config():
    missing = []

    if not FISHERIES_AGENT_ID:
        missing.append("FISHERIES_AGENT_ID")
    if not FISHERIES_AGENT_ALIAS_ID:
        missing.append("FISHERIES_AGENT_ALIAS_ID")

    if not OVERFISHING_AGENT_ID:
        missing.append("OVERFISHING_AGENT_ID")
    if not OVERFISHING_AGENT_ALIAS_ID:
        missing.append("OVERFISHING_AGENT_ALIAS_ID")

    if missing:
        raise RuntimeError(
            f"[CONFIG ERROR] Missing environment variables: {missing}"
        )