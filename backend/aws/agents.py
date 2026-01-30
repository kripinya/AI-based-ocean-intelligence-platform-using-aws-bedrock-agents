# backend/aws/agents.py

import logging
from aws.bedrock_client import call_bedrock
from rag.src.search import search_context
from aws.config import (
    FISHERIES_AGENT_ID,
    OVERFISHING_AGENT_ID,
)

logger = logging.getLogger(__name__)

def _invoke_client_side_agent(user_input: str, system_prompt: str, context: str) -> str:
    """
    Executes a "Client-Side Agent" workflow:
    1. Combines System Prompt + Context + User Input.
    2. Calls AWS Bedrock (Claude) to generate the response.
    
    This satisfies the requirement of using AWS Bedrock for intelligence while allowing
    access to local RAG data (which Cloud Bedrock Agents cannot reach directly).
    """
    full_prompt = f"""
{system_prompt}

Context Information:
{context}

User Query:
{user_input}
"""
    # Call AWS Bedrock Model directly
    return call_bedrock(full_prompt)


def invoke_fisheries_agent(user_input: str) -> str:
    """
    Orchestrates the Fisheries Agent workflow:
    1. Retreives relevant documents from Local ChromaDB (Fisheries).
    2. Uses AWS Bedrock to generate the final answer.
    """
    if not FISHERIES_AGENT_ID:
        logger.warning("FISHERIES_AGENT_ID not set, but proceeding with Client-Side RAG.")

    # 1. Retrieve Context from Local RAG
    print(f"🎣 Fisheries Agent: Retrieving context for '{user_input}'...")
    context = search_context(
        user_input, 
        db_path="rag/database/chroma_db_fisheries",
        collection_name=None
    )

    # 2. Define System Persona
    system_prompt = (
        "You are a Marine Biologist and Fisheries Expert. "
        "Use the provided scientific context to answer the user's question accurately."
    )

    # 3. Invoke Bedrock
    return _invoke_client_side_agent(user_input, system_prompt, context)


def invoke_overfishing_agent(user_input: str) -> str:
    """
    Orchestrates the Overfishing Agent workflow:
    1. Retreives relevant regulations/stats from Local ChromaDB (Overfishing).
    2. Uses AWS Bedrock to generate the final answer.
    """
    if not OVERFISHING_AGENT_ID:
        logger.warning("OVERFISHING_AGENT_ID not set, but proceeding with Client-Side RAG.")

    # 1. Retrieve Context from Local RAG
    print(f"⚠️ Overfishing Agent: Retrieving context for '{user_input}'...")
    context = search_context(
        user_input, 
        db_path="rag/database/chroma_db_overfishing",
        collection_name=None
    )

    # 2. Define System Persona
    system_prompt = (
        "You are a Fisheries Policy and Conservation Expert. "
        "Use the provided context to analyze overfishing scenarios and recommend solutions."
    )

    # 3. Invoke Bedrock
    return _invoke_client_side_agent(user_input, system_prompt, context)