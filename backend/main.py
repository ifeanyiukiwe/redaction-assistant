from fastapi import FastAPI
from pydantic import BaseModel
from detect import find_emails, find_postcodes

app = FastAPI(title="Redaction Assistant API")


class SuggestionRequest(BaseModel):
    text: str


class Suggestion(BaseModel):
    type: str
    text: str
    start: int
    end: int


class SuggestionResponse(BaseModel):
    suggestions: list[Suggestion]


@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/suggestions", response_model=SuggestionResponse)
def suggest(request: SuggestionRequest):
   
    emails = find_emails(request.text)
   
    postcodes = find_postcodes(request.text)
    
    findings = emails + postcodes
   
    findings.sort(key=lambda f: f["start"])
    return {"suggestions": findings}