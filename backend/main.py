from fastapi import FastAPI

app = FastAPI(title="Redaction Assistant API")


@app.get("/health")
def health():
    return {"status": "ok"}