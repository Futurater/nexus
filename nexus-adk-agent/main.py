import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google.adk.agents.llm_agent import Agent

app = FastAPI(title="Nexus ADK Transcript Summarizer")

class SummarizeRequest(BaseModel):
    transcript: str

class SummarizeResponse(BaseModel):
    summary: str

# 1) Initialize the Google ADK Agent using Gemini 1.5 Flash
summarizer_agent = Agent(
    name="MeetingSummarizer",
    model="gemini-1.5-flash",
    description="An agent that summarizes video meeting transcripts.",
    instruction=(
        "You are an expert meeting summarizer. Read the given transcript and "
        "provide a concise summary of the key discussion points, decisions made, "
        "and action items. Ensure the output is clean and professional."
    )
)

@app.post("/summarize", response_model=SummarizeResponse)
async def summarize(request: SummarizeRequest):
    if not request.transcript or not request.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript cannot be empty.")
    
    prompt = f"Summarize the following meeting transcript:\n\n{request.transcript}"
    
    try:
        # 2) Execute the Agent (In ADK, most interfaces use .run() or .invoke())
        try:
            response = summarizer_agent.run(prompt)
        except AttributeError:
            response = summarizer_agent.invoke(prompt)

        # 3) Extract response text mapping to common GenAI SDK property structures
        summary_text = response.text if hasattr(response, 'text') else str(response)
        
        return SummarizeResponse(summary=summary_text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

# Cloud Run Entrypoint
if __name__ == "__main__":
    import uvicorn
    # Google Cloud Run provides the PORT environment variable (default 8080)
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
