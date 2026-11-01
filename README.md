# Redaction Assistant

A prototype that finds personal data in text and suggests it for redaction, for teams preparing documents for release, such as responses to Subject Access Requests.

> **Made-up data only.** This prototype is tested with fictional examples and Ofcom's reserved drama phone numbers. It has never been used with real personal data.

## What it detects

- Email addresses (including multi-part domains such as `.gov.uk`)
- UK postcodes (with or without a space)
- UK phone numbers (mobile, landline, +44)

## How it works

Text is sent to `POST /suggestions`. Each detector (email, postcode and phone) returns what it found, with its type and start/end position, and the results come back in reading order. A person reviews every suggestion; nothing is redacted automatically.

## Run it locally

Windows (Git Bash):

```bash
cd backend
py -m venv .venv
source .venv/Scripts/activate
pip install -r requirements.txt
fastapi dev main.py
```

Then open http://127.0.0.1:8000/docs

## Run the tests

```bash
cd backend
pytest
```

## Example

**Request**

```json
{
  "text": "Call Jane on 07700 900123 or email jane@justice.gov.uk. Address: SW1A 2AA."
}
```

**Response**

```json
{
  "suggestions": [
    { "type": "phone", "text": "07700 900123", "start": 13, "end": 25 },
    { "type": "email", "text": "jane@justice.gov.uk", "start": 35, "end": 54 },
    { "type": "postcode", "text": "SW1A 2AA", "start": 65, "end": 73 }
  ]
}
```

## Roadmap

- [x] API tests with TestClient
- [ ] Next.js front end to accept or reject each suggestion
- [ ] PostgreSQL to record review decisions
- [ ] PDF text extraction
- [ ] GitHub Actions to run tests on every push
