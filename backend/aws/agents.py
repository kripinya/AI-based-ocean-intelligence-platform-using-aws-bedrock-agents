# backend/aws/agents.py

import uuid
from aws.bedrock_client import get_bedrock_agent_runtime
from aws.config import (
    FISHERIES_AGENT_ID,
    FISHERIES_AGENT_ALIAS_ID,
    OVERFISHING_AGENT_ID,
    OVERFISHING_AGENT_ALIAS_ID,
)

def _invoke_agent(agent_id: str, alias_id: str, user_input: str) -> str:
    """
    Shared helper to invoke any Bedrock Agent.
    """
    client = get_bedrock_agent_runtime()
    session_id = str(uuid.uuid4())

    response = client.invoke_agent(
        agentId=agent_id,
        agentAliasId=alias_id,
        sessionId=session_id,
        inputText=user_input,
    )

    chunks = []
    for event in response.get("completion", []):
        if "chunk" in event:
            chunks.append(event["chunk"]["bytes"].decode("utf-8"))

    return "".join(chunks)


def invoke_fisheries_agent(user_input: str) -> str:
    if not FISHERIES_AGENT_ID or not FISHERIES_AGENT_ALIAS_ID:
        raise RuntimeError("Fisheries Agent env vars not set")

    return _invoke_agent(
        FISHERIES_AGENT_ID,
        FISHERIES_AGENT_ALIAS_ID,
        user_input,
    )


def invoke_overfishing_agent(user_input: str) -> str:
    if not OVERFISHING_AGENT_ID or not OVERFISHING_AGENT_ALIAS_ID:
        raise RuntimeError("Overfishing Agent env vars not set")

    return _invoke_agent(
        OVERFISHING_AGENT_ID,
        OVERFISHING_AGENT_ALIAS_ID,
        user_input,
    )