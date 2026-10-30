import re

EMAIL_PATTERN = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
POSTCODE_PATTERN = re.compile(r"\b[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}\b", re.IGNORECASE)
PHONE_PATTERN = re.compile(r"(?<!\w)(?:\+44\s?|0)\d{2,4}\s?\d{3,4}\s?\d{3,4}(?!\d)")

def find_matches(pattern: re.Pattern, kind: str, text: str) -> list[dict]:
    findings = []
    for match in pattern.finditer(text):
        findings.append({
            "type": kind,
            "text": match.group(),
            "start": match.start(),
            "end": match.end(),
        })
    return findings   


def find_emails(text: str) -> list[dict]:  
    return find_matches(EMAIL_PATTERN, "email", text)

def find_postcodes(text: str) -> list[dict]:
    return find_matches(POSTCODE_PATTERN, "postcode", text)

def find_phones(text: str) -> list[dict]:
    return find_matches(PHONE_PATTERN, "phone", text)
