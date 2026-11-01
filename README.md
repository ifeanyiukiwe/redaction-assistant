# Redaction Assistant

[![Tests](https://github.com/ifeanyiukiwe/redaction-assistant/actions/workflows/tests.yml/badge.svg)](https://github.com/ifeanyiukiwe/redaction-assistant/actions/workflows/tests.yml)

**Live demo:** https://redaction-assistant.vercel.app (the first check may take up to a minute while the free server wakes up)
**API docs:** https://redaction-assistant-api.onrender.com/docs

A prototype that finds personal data in text and suggests it for redaction, for teams preparing documents for release, such as responses to Subject Access Requests.

> **Made-up data only.** This prototype is tested with fictional examples, Ofcom's reserved drama phone numbers and a public postcode. It has never been used with real personal data.

## What it detects

- Email addresses (including multi-part domains such as `.gov.uk`)
- UK postcodes (with or without a space)
- UK phone numbers (mobile, landline, +44)

## How it works

1. A caseworker pastes document text and selects **Find personal data**.
2. The front end sends the text to `POST /suggestions`. Each detector returns what it found, with its type and start/end position, in reading order.
3. Each suggestion is highlighted in place. The caseworker **accepts** (redact) or **rejects** (keep) each one.
4. Only when every suggestion has a decision does the **redacted output** appear, ready to copy.

A person makes every decision; nothing is redacted automatically.

## Design decisions

- **Suggest, don't decide.** Only a person can judge whose data it is. A requester's own email should stay visible, while a third party's should be hidden.
- **True redaction, not black boxes.** Accepted items are removed from the output and replaced with blocks, so they can't be copied or read by assistive technology.
- **Release only when fully reviewed.** The output is unavailable until every suggestion is decided, so a half-checked document can't be copied.
- **A failure never looks like a clean result.** If the service can't be reached, the page shows an error instead of "Found 0", which could be mistaken for a document with no personal data.
- **Positions are tied to the checked text.** Highlights use a snapshot of the text that was checked, so editing the text afterwards can't shift redactions onto the wrong characters.
- **Restricted CORS.** The API only accepts requests from the deployed front end and local development, configured through an environment variable.

## Accessibility

- Labelled form fields and visible keyboard focus on every control
- Accept and Reject buttons use `aria-pressed` and unique accessible names (for example, "Accept phone 07700 900123")
- Status changes ("Checking…", "Found 3…", "Copied") are announced through live regions
- Redacted items are announced as "redacted phone" rather than a run of block characters

## Tech stack

| Part      | Technology                                                             |
| --------- | ---------------------------------------------------------------------- |
| Back end  | Python 3.13, FastAPI, Pydantic                                         |
| Front end | Next.js, React, TypeScript, Tailwind CSS                               |
| Testing   | pytest (unit tests and API tests with TestClient)                      |
| CI        | GitHub Actions: back-end tests, front-end lint and build on every push |
| Hosting   | Render (API), Vercel (front end)                                       |

## Run it locally

Windows (Git Bash). **Back end:**

```bash
cd backend
py -m venv .venv
source .venv/Scripts/activate
pip install -r requirements.txt
fastapi dev main.py
```

API docs: http://127.0.0.1:8000/docs

**Front end** (in a second terminal):

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000" > .env.local
npm run dev
```

Then open http://localhost:3000

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
- [x] Next.js front end to accept or reject each suggestion
- [x] GitHub Actions to run tests on every push
- [x] Deploy (Render and Vercel)
- [ ] PostgreSQL to record review decisions (audit trail)
- [ ] PDF text extraction
- [ ] More detectors, such as National Insurance numbers
- [ ] Docker
- [ ] AWS (S3 for documents, RDS for PostgreSQL, SQS for large files)
