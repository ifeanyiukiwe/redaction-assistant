import re

EMAIL_PATTERN = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
POSTCODE_PATTERN = re.compile(r"\b[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}\b", re.IGNORECASE)
PHONE_PATTERN = re.compile(r"(?<!\w)(?:\+44\s?|0)\d{2,4}\s?\d{3,4}\s?\d{3,4}(?!\d)")


def find_emails(text: str) -> list[dict]:  
    findings = []
    for match in EMAIL_PATTERN.finditer(text):
        findings.append({
            "type": "email",
            "text": match.group(),
            "start": match.start(),
            "end": match.end(),
            
        })
    return findings

def find_postcodes(text: str) -> list[dict]:
    findings = []
    for match in POSTCODE_PATTERN.finditer(text):
        findings.append({
            "type": "postcode",
            "text": match.group(),
            "start": match.start(),
            "end": match.end(),
        })
    return findings

def find_phones(text: str) -> list[dict]:
    findings = []
    for match in PHONE_PATTERN.finditer(text):
        findings.append({
            "type": "phone",
            "text": match.group(),
            "start": match.start(),
            "end": match.end(),
        })
    return findings