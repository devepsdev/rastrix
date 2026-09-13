from datetime import date

from pipeline.extract import extract_markets, normalize_market

TODAY = date(2026, 9, 13)
SOURCE = {"nombre": "Agenda de prueba", "url": "https://ejemplo.test/agenda", "provincia": "Madrid"}


class FakeClient:
    def __init__(self, response):
        self.response = response
        self.messages = None

    def complete_json(self, messages):
        self.messages = messages
        return self.response


def test_normalizes_a_complete_weekly_market():
    market = normalize_market(
        {"name": "  Rastro  de Ejemplo ", "city": "Ejemplo", "frequency": "Semanal", "dayOfWeek": "Miércoles",
         "startTime": "9:00", "endTime": "14.30", "description": "Muebles y vinilos."},
        SOURCE, TODAY)

    assert market["name"] == "Rastro de Ejemplo"
    assert market["frequency"] == "semanal"
    assert market["dayOfWeek"] == "miercoles"
    assert market["startTime"] == "09:00"
    assert market["endTime"] == "14:30"
    assert market["province"] == "Madrid"  # sale de la fuente
    assert market["sourceUrl"] == SOURCE["url"]


def test_discards_markets_without_name_or_city():
    assert normalize_market({"name": "Rastro"}, SOURCE, TODAY) is None
    assert normalize_market({"city": "Madrid"}, SOURCE, TODAY) is None


def test_city_can_come_from_the_source():
    market = normalize_market({"name": "Rastro"}, {**SOURCE, "ciudad": "Vic"}, TODAY)
    assert market["city"] == "Vic"


def test_invalid_values_become_null_instead_of_breaking_the_api():
    market = normalize_market(
        {"name": "Rastro", "city": "Vic", "frequency": "a veces", "dayOfWeek": "finde",
         "startTime": "25:00", "startDate": "mañana"},
        SOURCE, TODAY)
    assert market["frequency"] is None
    assert market["dayOfWeek"] is None
    assert market["startTime"] is None
    assert market["startDate"] is None


def test_one_off_event_keeps_dates_and_drops_day():
    market = normalize_market(
        {"name": "Feria", "city": "Madrid", "frequency": "puntual", "dayOfWeek": "sabado",
         "startDate": "2026-10-01", "endDate": "2026-10-04"},
        SOURCE, TODAY)
    assert market["dayOfWeek"] is None
    assert market["startDate"] == "2026-10-01"
    assert market["endDate"] == "2026-10-04"


def test_past_one_off_event_is_discarded():
    assert normalize_market(
        {"name": "Feria vieja", "city": "Madrid", "frequency": "puntual", "startDate": "2026-05-01"},
        SOURCE, TODAY) is None


def test_recurring_market_ignores_dates():
    market = normalize_market(
        {"name": "Rastro", "city": "Madrid", "frequency": "semanal", "startDate": "2026-10-01"}, SOURCE, TODAY)
    assert market["startDate"] is None


def test_long_texts_are_trimmed_and_overlong_names_discarded():
    market = normalize_market({"name": "Rastro", "city": "Madrid", "description": "x" * 5000}, SOURCE, TODAY)
    assert len(market["description"]) == 2000
    assert normalize_market({"name": "n" * 151, "city": "Madrid"}, SOURCE, TODAY) is None


def test_extract_markets_filters_the_model_response():
    client = FakeClient({"markets": [
        {"name": "Rastro bueno", "city": "Madrid", "frequency": "semanal"},
        {"name": "Sin ciudad"},
        "basura",
    ]})
    markets = extract_markets("texto", SOURCE, client, today=TODAY)

    assert [m["name"] for m in markets] == ["Rastro bueno"]
    assert "json" in client.messages[0]["content"]  # requisito del modo JSON de DeepSeek


def test_extract_markets_survives_an_unexpected_shape():
    assert extract_markets("texto", SOURCE, FakeClient({"otra": 1}), today=TODAY) == []
    assert extract_markets("texto", SOURCE, FakeClient([]), today=TODAY) == []


def test_source_location_fills_a_single_market_page():
    client = FakeClient({"markets": [{"name": "Rastro de Vic"}]})
    markets = extract_markets("texto", {**SOURCE, "ciudad": "Vic", "provincia": "Barcelona"}, client, today=TODAY)

    assert markets[0]["city"] == "Vic"
    assert markets[0]["province"] == "Barcelona"


def test_source_location_is_not_spread_over_a_listing():
    # Un listado regional: la ciudad de la fuente no es la de todos los mercados.
    client = FakeClient({"markets": [
        {"name": "Mercadillo de Granada", "city": "Granada"},
        {"name": "Rastro del Sur"},
        {"name": "Rastro de Motril", "city": "Motril"},
    ]})
    markets = extract_markets("texto", {**SOURCE, "ciudad": "Granada", "provincia": "Granada"}, client, today=TODAY)

    assert [m["name"] for m in markets] == ["Mercadillo de Granada", "Rastro de Motril"]
    assert all(m["province"] is None for m in markets)
