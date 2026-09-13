import pytest

from services.deepseek_client import DeepSeekClient, RetryableError, TruncatedResponseError


class FakeResponse:
    def __init__(self, body, status_code=200):
        self.body = body
        self.status_code = status_code

    def json(self):
        return self.body

    def raise_for_status(self):
        pass


class FakeSession:
    def __init__(self, *bodies):
        self.bodies = list(bodies)
        self.payloads = []

    def post(self, url, headers, json, timeout):
        self.payloads.append(json)
        return FakeResponse(self.bodies.pop(0))


def choice(content, finish_reason="stop"):
    return {"choices": [{"finish_reason": finish_reason, "message": {"content": content}}]}


@pytest.fixture(autouse=True)
def no_wait(monkeypatch):
    monkeypatch.setattr(DeepSeekClient.complete_json.retry, "wait", lambda retry_state: 0)


def test_returns_parsed_json_with_thinking_disabled():
    session = FakeSession(choice('{"markets": []}'))
    result = DeepSeekClient("clave", "deepseek-flash", session).complete_json([{"role": "user", "content": "json"}])

    assert result == {"markets": []}
    assert session.payloads[0]["thinking"] == {"type": "disabled"}
    assert session.payloads[0]["response_format"] == {"type": "json_object"}


def test_truncated_response_fails_without_retrying():
    session = FakeSession(choice('{"markets": [', "length"), choice('{"markets": []}'))

    with pytest.raises(TruncatedResponseError):
        DeepSeekClient("clave", "deepseek-flash", session).complete_json([])
    assert len(session.payloads) == 1


def test_empty_response_is_retried():
    session = FakeSession(choice(""), choice('{"markets": []}'))
    assert DeepSeekClient("clave", "deepseek-flash", session).complete_json([]) == {"markets": []}
    assert len(session.payloads) == 2


def test_gives_up_after_three_empty_responses():
    session = FakeSession(choice(""), choice(""), choice(""))
    with pytest.raises(RetryableError):
        DeepSeekClient("clave", "deepseek-flash", session).complete_json([])
