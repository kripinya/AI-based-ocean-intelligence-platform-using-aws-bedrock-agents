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
    # Using Amazon Nova Micro as per Hackathon guidelines
    # Only Amazon models are allowed (Nova, Titan)
    model_id = "amazon.nova-micro-v1:0"
    
    body = {
        "inferenceConfig": {
            "max_new_tokens": 1000
        },
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }

    try:
        response = client.invoke_model(
            modelId=model_id,
            body=json.dumps(body),
            contentType="application/json",
            accept="application/json"
        )

        result = json.loads(response["body"].read())
        # Parse Nova response format
        return result["output"]["message"]["content"][0]["text"]
        
    except Exception as e:
        return f"Error calling AWS Bedrock ({model_id}): {str(e)}"

def get_bedrock_agent_runtime():
    """Get bedrock-agent-runtime client with credentials from environment."""
    session = get_boto3_session()
    return session.client("bedrock-agent-runtime")