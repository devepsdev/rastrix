from pipeline.fetch import Page
from pipeline.run import run
from pipeline.state import State
from services.rastrix_api import SubmitResult

SOURCE = {"nombre": "Agenda", "url": "https://ejemplo.test/agenda"}


class FakeFetcher:
    def __init__(self, text="página", allowed=True, error=None):
        self.text, self._allowed, self.error = text, allowed, error

    def allowed(self, url):
        return self._allowed

    def fetch(self, url):
        if self.error:
            raise self.error
        return Page(url=url, text=self.text, content_hash=f"hash-{self.text}")


class FakeClient:
    def __init__(self, markets):
        self.markets = markets
        self.calls = 0

    def complete_json(self, messages):
        self.calls += 1
        return {"markets": self.markets}


class FakeApi:
    def __init__(self, outcomes):
        self.outcomes = list(outcomes)
        self.sent = []

    def submit_suggestion(self, suggestion):
        self.sent.append(suggestion)
        return SubmitResult(self.outcomes.pop(0))


MARKETS = [{"name": "Rastro A", "city": "Madrid"}, {"name": "Rastro B", "city": "Vic"}]


def test_sends_markets_and_counts_outcomes():
    api = FakeApi(["created", "duplicate"])
    summary = run([SOURCE], fetcher=FakeFetcher(), client=FakeClient(MARKETS), api=api, state=State(":memory:"))

    assert summary.created == 1
    assert summary.duplicates == 1
    assert [s["name"] for s in api.sent] == ["Rastro A", "Rastro B"]


def test_unchanged_page_is_not_analysed_again():
    state = State(":memory:")
    client = FakeClient(MARKETS)
    run([SOURCE], fetcher=FakeFetcher(), client=client, api=FakeApi(["created", "created"]), state=state)
    summary = run([SOURCE], fetcher=FakeFetcher(), client=client, api=FakeApi([]), state=state)

    assert client.calls == 1
    assert summary.skipped_unchanged == 1


def test_dry_run_sends_nothing_and_remembers_nothing():
    state = State(":memory:")
    api = FakeApi([])
    run([SOURCE], fetcher=FakeFetcher(), client=FakeClient(MARKETS), api=api, state=state, dry_run=True)

    assert api.sent == []
    assert not state.is_unchanged(SOURCE["url"], "hash-página")


def test_robots_blocked_page_is_skipped():
    client = FakeClient(MARKETS)
    summary = run([SOURCE], fetcher=FakeFetcher(allowed=False), client=client, api=FakeApi([]), state=State(":memory:"))

    assert summary.skipped_robots == 1
    assert client.calls == 0


def test_a_broken_source_does_not_stop_the_rest_and_is_retried_next_time():
    state = State(":memory:")
    broken = {"nombre": "Rota", "url": "https://rota.test"}
    fetchers = {"https://rota.test": FakeFetcher(error=RuntimeError("503"))}

    class RoutingFetcher:
        def allowed(self, url):
            return True

        def fetch(self, url):
            return fetchers.get(url, FakeFetcher()).fetch(url)

    summary = run([broken, SOURCE], fetcher=RoutingFetcher(), client=FakeClient(MARKETS),
                  api=FakeApi(["created", "created"]), state=state)

    assert summary.failed_sources == ["Rota"]
    assert summary.created == 2
    assert not state.is_unchanged("https://rota.test", "hash-página")


def test_page_is_not_marked_processed_when_submission_fails():
    state = State(":memory:")

    class ExplodingApi:
        def submit_suggestion(self, suggestion):
            raise RuntimeError("API caída")

    run([SOURCE], fetcher=FakeFetcher(), client=FakeClient(MARKETS), api=ExplodingApi(), state=state)
    assert not state.is_unchanged(SOURCE["url"], "hash-página")
