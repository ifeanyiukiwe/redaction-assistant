from fastapi import FastAPI
from pydantic import BaseModel
from detect import find_emails, find_postcodes, find_phones
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Redaction Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


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
    phones = find_phones(request.text)
    findings = emails + postcodes + phones
    findings.sort(key=lambda f: f["start"])
    return {"suggestions": findings}