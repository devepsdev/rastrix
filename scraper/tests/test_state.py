from pipeline.state import State


def test_page_is_changed_until_processed_and_again_when_content_changes():
    state = State(":memory:")
    url = "https://ejemplo.test"

    assert not state.is_unchanged(url, "a")
    state.mark_processed(url, "a")
    assert state.is_unchanged(url, "a")
    assert not state.is_unchanged(url, "b")
