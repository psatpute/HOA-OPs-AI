from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
import httpx

from auth.middleware import get_current_user
from models.user import UserInDB
from config import settings

router = APIRouter(prefix="/ai", tags=["AI Chatbot"])


class ChatRequest(BaseModel):
    """Chat request model."""
    message: str = Field(..., min_length=1, description="User's message to the AI chatbot")


class ChatResponse(BaseModel):
    """Chat response model."""
    message: str = Field(..., description="AI's response message")


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a message to the AI chatbot and receive a response.
    
    This endpoint is publicly accessible and does not require authentication.
    
    Args:
        request: Chat request containing the user's message
        
    Returns:
        AI's response message
        
    Raises:
        HTTPException: If OpenAI API key is missing or API call fails
    """
    # Check for OpenAI API key
    if not settings.openai_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable."
        )
    
    try:
        # Make direct API call to OpenAI using httpx
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.openai_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a helpful assistant for an HOA (Homeowners Association) management system. Help users with questions about HOA operations, financial management, project tracking, and document management."
                        },
                        {
                            "role": "user",
                            "content": request.message
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 500
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                error_data = response.json().get("error", {})
                error_message = error_data.get("message", "Unknown error")
                error_type = error_data.get("type", "")
                
                # Handle quota exceeded error specifically
                if response.status_code == 429 or "quota" in error_message.lower():
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail="The AI chatbot service is temporarily unavailable due to API quota limits. Please try again later or contact support to upgrade the service plan."
                    )
                
                # Handle other API errors
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"OpenAI API error: {error_message}"
                )
            
            # Extract the response message
            data = response.json()
            ai_message = data["choices"][0]["message"]["content"]
            
            return ChatResponse(message=ai_message)
        
    except httpx.HTTPError as e:
        # Handle HTTP errors
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"OpenAI API error: {str(e)}"
        )
    except Exception as e:
        # Handle any other unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing your request: {str(e)}"
        )