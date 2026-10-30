from detect import find_emails, find_postcodes, find_phones

def test_finds_one_email():
    result = find_emails("Contact jane.doe@example.com today")
    assert len(result) == 1
    assert result[0]["text"] == "jane.doe@example.com"

def test_finds_no_email():
    result = find_emails("No contact details here")
    assert result == []

def test_finds_two_emails():
    result = find_emails("Email a@test.com or b@test.org")
    assert len(result) == 2
    assert result[0]["text"] == "a@test.com"
    assert result[1]["text"] == "b@test.org"

def test_finds_postcode_with_space():
    result = find_postcodes("Send it to SW1A 2AA please")
    assert len(result) == 1
    assert result[0]["text"] == "SW1A 2AA"

def test_finds_no_postcode():
    result = find_postcodes("Send it to ")
    assert result == []

def test_finds_postcode_without_space():
    result = find_postcodes("Send it to SW1A2AA please")
    assert len(result) == 1
    assert result[0]["text"] == "SW1A2AA"

def test_email_at_end_of_sentence_excludes_full_stop():
    result = find_emails("Copy to admin@test.org.")
    assert result[0]["text"] == "admin@test.org"

def test_finds_email_with_multi_part_domain():
    result = find_emails("Email jane@justice.gov.uk today")
    assert result[0]["text"] == "jane@justice.gov.uk"

def test_finds_mobile_with_space():
    result = find_phones("Call me on 07700 900123 tomorrow")
    assert result[0]["text"] == "07700 900123"

def test_finds_mobile_without_space():
    result = find_phones("Call me on 07700900123")
    assert result[0]["text"] == "07700900123"

def test_finds_international_mobile():
    result = find_phones("Ring +44 7700 900123 after 5pm")
    assert result[0]["text"] == "+44 7700 900123"

def test_finds_landline():
    result = find_phones("0191 498 0123")
    assert result[0]["text"] == "0191 498 0123"

def test_no_phone_returns_empty_list():
    result = find_phones("Case 12345")
    assert result == []

def test_phone_finding_has_correct_type_and_position():
    result = find_phones("Call me on 07700 900123 tomorrow")
    assert result == [{"type": "phone", "text": "07700 900123", "start": 11, "end": 23}]                                         