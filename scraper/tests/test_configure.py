import importlib.util
from pathlib import Path

import pytest
from dotenv import dotenv_values

SCRIPT = Path(__file__).resolve().parent.parent / "scripts" / "configure.py"
spec = importlib.util.spec_from_file_location("configure", SCRIPT)
configure = importlib.util.module_from_spec(spec)
spec.loader.exec_module(configure)

TRICKY = [
    "normal2026",
    "con$dolar${HOME}",
    "con#almohadilla y espacios",
    "comilla'simple",
    'comilla"doble',
    "barra\\invertida\\n",
    "todo'junto\"$x#\\",
]


@pytest.mark.parametrize("secret", TRICKY)
def test_the_scraper_reads_back_exactly_what_was_saved(tmp_path, secret):
    env = tmp_path / ".env"
    configure.write_env(env, {"RASTRIX_PASSWORD": secret, "DEEPSEEK_API_KEY": "sk-prueba"})

    # Así lo lee el scraper (core/config.py).
    loaded = dotenv_values(env, interpolate=False)
    assert loaded["RASTRIX_PASSWORD"] == secret
    # Y así lo relee el propio script para ofrecer los valores actuales.
    assert configure.read_env(env)["RASTRIX_PASSWORD"] == secret


def test_rewriting_keeps_unknown_variables(tmp_path):
    env = tmp_path / ".env"
    env.write_text("RASTRIX_EMAIL=bot@test\nSOURCES_FILE=/otra/ruta.yaml\n", encoding="utf-8")
    assert configure.read_env(env) == {"RASTRIX_EMAIL": "bot@test", "SOURCES_FILE": "/otra/ruta.yaml"}
