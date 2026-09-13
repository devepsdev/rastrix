import re
import unicodedata
from datetime import date

from core.logger import logger

FREQUENCIES = {"diario", "semanal", "quincenal", "mensual", "puntual"}
DAYS = {"lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"}

SYSTEM_PROMPT = """Eres un asistente que extrae mercados de antigüedades de páginas web españolas.

Extrae SOLO mercados, rastros, almonedas, brocantes o ferias de antigüedades,
vintage, coleccionismo o segunda mano. Ignora mercados de alimentación,
mercadillos de ropa nueva y cualquier otro tipo de evento.

Reglas:
- No inventes nada. Si un dato no aparece en el texto, usa null.
- "frequency" solo puede ser: diario, semanal, quincenal, mensual o puntual
  (puntual = fechas concretas, como una feria anual).
- "dayOfWeek" solo puede ser: lunes, martes, miercoles, jueves, viernes, sabado
  o domingo (sin tildes). Déjalo en null si el mercado es puntual.
- Fechas en formato AAAA-MM-DD y solo para mercados puntuales.
- Horas en formato HH:MM de 24 horas.
- "description": una o dos frases en español redactadas por ti con lo que se
  puede encontrar. No copies el texto de la página.
- "contact": web, teléfono o correo del organizador si aparece.

Responde únicamente con un objeto json con esta forma:
{"markets": [{"name": "...", "city": "...", "province": "...", "address": "...",
  "frequency": "semanal", "dayOfWeek": "domingo", "startDate": null, "endDate": null,
  "startTime": "09:00", "endTime": "14:00", "description": "...", "contact": "..."}]}
Si la página no anuncia ningún mercado de este tipo, responde {"markets": []}."""

LIMITS = {"name": 150, "city": 100, "province": 100, "address": 255, "description": 2000, "contact": 255}


def extract_markets(page_text: str, source: dict, client, today: date | None = None) -> list[dict]:
    """Pide a DeepSeek los mercados de la página y devuelve solo los que pasan la validación."""
    hints = ", ".join(f"{key}: {source[key]}" for key in ("provincia", "ciudad") if source.get(key))
    user_prompt = f"Página: {source['url']}\n" + (
        f"Si la página trata de un único mercado y no indica dónde se celebra, está en: {hints}.\n" if hints else "")
    data = client.complete_json([
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt + "\nTexto de la página:\n" + page_text},
    ])

    raw_markets = data.get("markets") if isinstance(data, dict) else None
    if not isinstance(raw_markets, list):
        logger.warning("Respuesta de DeepSeek sin lista de mercados; se ignora")
        return []

    # La ciudad y la provincia de sources.yaml describen el mercado de una página
    # dedicada a uno solo. En un listado de varios, aplicarlas pondría esa ciudad a
    # mercados de otros sitios que la página no localiza.
    entries = [raw for raw in raw_markets if isinstance(raw, dict)]
    location_hints = source if len(entries) == 1 else {k: v for k, v in source.items() if k not in ("ciudad", "provincia")}

    markets = []
    for raw in entries:
        market = normalize_market(raw, location_hints, today or date.today())
        if market is not None:
            markets.append(market)
    return markets


def normalize_market(raw, source: dict, today: date) -> dict | None:
    """
    Convierte lo que devuelve el modelo en una sugerencia válida para la API, o
    None si no sirve. Un modelo de lenguaje no es fiable con los formatos: todo
    se comprueba aquí antes de enviarlo.
    """
    if not isinstance(raw, dict):
        return None

    name = _text(raw.get("name"))
    city = _text(raw.get("city")) or _text(source.get("ciudad"))
    if not name or not city:
        return None
    if len(name) > LIMITS["name"] or len(city) > LIMITS["city"]:
        logger.debug("Descartado por nombre o ciudad demasiado largos: %s", name[:60])
        return None

    frequency = _plain(raw.get("frequency"))
    frequency = frequency if frequency in FREQUENCIES else None
    day = _plain(raw.get("dayOfWeek"))
    day = day if day in DAYS else None

    start_date = _date(raw.get("startDate"))
    end_date = _date(raw.get("endDate"))
    if frequency == "puntual":
        day = None
        # Un evento que ya ha pasado no aporta nada a la bandeja.
        last_day = end_date or start_date
        if last_day is not None and last_day < today:
            logger.debug("Descartado por fechas pasadas: %s", name)
            return None
    else:
        start_date = end_date = None

    return {
        "name": name,
        "city": city,
        "province": _limited(raw.get("province"), "province") or _limited(source.get("provincia"), "province"),
        "address": _limited(raw.get("address"), "address"),
        "frequency": frequency,
        "dayOfWeek": day,
        "startDate": start_date.isoformat() if start_date else None,
        "endDate": end_date.isoformat() if end_date else None,
        "startTime": _time(raw.get("startTime")),
        "endTime": _time(raw.get("endTime")),
        "description": _limited(raw.get("description"), "description"),
        "contact": _limited(raw.get("contact"), "contact"),
        "comment": f"Extraído automáticamente de «{source.get('nombre', source['url'])}».",
        "sourceUrl": source["url"][:500],
    }


def _text(value) -> str | None:
    if not isinstance(value, str):
        return None
    collapsed = re.sub(r"\s+", " ", value).strip()
    return collapsed or None


def _limited(value, field: str) -> str | None:
    text = _text(value)
    return text[: LIMITS[field]] if text else None


def _plain(value) -> str | None:
    """"Miércoles" -> "miercoles": el modelo no siempre respeta la regla de las tildes."""
    text = _text(value)
    if not text:
        return None
    return "".join(c for c in unicodedata.normalize("NFD", text.lower()) if unicodedata.category(c) != "Mn")


def _date(value) -> date | None:
    text = _text(value)
    if not text:
        return None
    try:
        return date.fromisoformat(text)
    except ValueError:
        return None


def _time(value) -> str | None:
    text = _text(value)
    match = re.fullmatch(r"(\d{1,2})[:.](\d{2})", text or "")
    if not match:
        return None
    hours, minutes = int(match.group(1)), int(match.group(2))
    return f"{hours:02d}:{minutes:02d}" if hours < 24 and minutes < 60 else None
