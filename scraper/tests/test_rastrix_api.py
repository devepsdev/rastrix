import pytest

from services.rastrix_api import ApiError, RastrixApi


class FakeResponse:
    def __init__(self, status, body=None):
        self.status_code = status
        self._body = body or {}
        self.text = str(body)

    def json(self):
        return self._body


class FakeSession:
    """Devuelve respuestas en orden y guarda las peticiones recibidas."""

    def __init__(self, responses):
        self.responses = list(responses)
        self.calls = []

    def post(self, url, **kwargs):
        self.calls.append(("POST", url))
        return self.responses.pop(0)

    def request(self, method, url, **kwargs):
        self.calls.append((method, url))
        return self.responses.pop(0)


LOGIN_OK = FakeResponse(200, {"accessToken": "t"})


def api(responses):
    return RastrixApi("https://api.test", "bot@test", "secreto", session=FakeSession(responses))


def test_created_duplicate_and_invalid_outcomes():
    client = api([LOGIN_OK, FakeResponse(201), FakeResponse(409, {"mensaje": "ya está"}), FakeResponse(400, {"mensaje": "mal", "errores": {"city": "vacía"}})])

    assert client.submit_suggestion({}).outcome == "created"
    duplicate = client.submit_suggestion({})
    assert duplicate.outcome == "duplicate" and "ya está" in duplicate.message
    invalid = client.submit_suggestion({})
    assert invalid.outcome == "invalid" and "city" in invalid.message


def test_logs_in_again_when_the_session_expires():
    session = FakeSession([LOGIN_OK, FakeResponse(401), LOGIN_OK, FakeResponse(201)])
    client = RastrixApi("https://api.test", "bot@test", "secreto", session=session)

    assert client.submit_suggestion({}).outcome == "created"
    assert [call for call in session.calls if call[1].endswith("/login")] == [
        ("POST", "https://api.test/api/auth/login"), ("POST", "https://api.test/api/auth/login")]


def test_refuses_to_run_with_an_account_that_is_not_the_scraper():
    client = api([LOGIN_OK, FakeResponse(200, {"role": "ADMIN"})])
    with pytest.raises(ApiError, match="SCRAPER"):
        client.require_scraper_role()


def test_failed_login_raises_a_clear_error():
    with pytest.raises(ApiError, match="iniciar sesión"):
        api([FakeResponse(401, {"mensaje": "credenciales"})]).login()
