import boto3
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(".env")

# Initialize clients with explicit credentials from environment
def get_boto3_session():
    """Create a boto3 session with credentials from environment variables."""
    return boto3.Session(
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_REGION", "us-east-1")
    )

# Create client using session
session = get_boto3_session()
client = session.client("bedrock-runtime")

def call_bedrock(prompt: str) -> str:
    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 500
    }

    response = client.invoke_model(
        modelId="anthropic.claude-3-sonnet-20240229-v1:0",
        body=json.dumps(body),
        contentType="application/json",
        accept="application/json"
    )

    result = json.loads(response["body"].read())
    return result["content"][0]["text"]

def get_bedrock_agent_runtime():
    """Get bedrock-agent-runtime client with credentials from environment."""
    session = get_boto3_session()
    return session.client("bedrock-agent-runtime")