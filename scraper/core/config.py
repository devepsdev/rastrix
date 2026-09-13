import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# En el despliegue, el código está en el repositorio y los datos (.env, estado,
# logs) en SCRAPER_HOME. En local, todo cuelga de la carpeta scraper/.
HOME = Path(os.getenv("SCRAPER_HOME", str(BASE_DIR)))

# interpolate=False: sin esto python-dotenv expande "$VAR" y una contraseña que
# contenga "$" llegaría corrupta a la API.
load_dotenv(HOME / ".env", interpolate=False)

RASTRIX_API_URL = os.getenv("RASTRIX_API_URL", "https://rastrix.deveps.dev").rstrip("/")
RASTRIX_EMAIL = os.getenv("RASTRIX_EMAIL", "")
RASTRIX_PASSWORD = os.getenv("RASTRIX_PASSWORD", "")

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-flash")

SOURCES_FILE = Path(os.getenv("SOURCES_FILE", str(BASE_DIR / "sources.yaml")))
STATE_DB = HOME / "data" / "state.db"

REQUEST_DELAY_SECONDS = float(os.getenv("REQUEST_DELAY_SECONDS", "3"))
USER_AGENT = "RastrixBot/1.0 (+https://rastrix.deveps.dev)"

# Tope de texto por página que se manda a DeepSeek: suficiente para una agenda
# larga y mantiene acotado el coste de cada llamada.
MAX_PAGE_CHARS = 20000


def missing_settings(dry_run: bool) -> list[str]:
    """Variables obligatorias que faltan. En simulación no hace falta la cuenta de la API."""
    required = {"DEEPSEEK_API_KEY": DEEPSEEK_API_KEY}
    if not dry_run:
        required |= {"RASTRIX_EMAIL": RASTRIX_EMAIL, "RASTRIX_PASSWORD": RASTRIX_PASSWORD}
    return [name for name, value in required.items() if not value]
