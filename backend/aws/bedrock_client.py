import boto3
import json
import os

client = boto3.client("bedrock-runtime", region_name="us-east-1")

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
    return boto3.client(
        "bedrock-agent-runtime",
        region_name=os.getenv("AWS_REGION", "us-east-1"),
    )