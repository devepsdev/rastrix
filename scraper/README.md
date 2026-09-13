# Scraper de Rastrix

Agente que recorre una lista de páginas web, extrae con DeepSeek los mercados de
antigüedades que anuncian y los envía como **sugerencias** a la bandeja de
revisión del panel. Nunca publica nada por su cuenta: todo pasa por una persona.

## Cómo funciona

1. Lee las fuentes de `sources.yaml`.
2. Descarga cada página respetando `robots.txt`, con una pausa entre páginas.
3. Si el texto no ha cambiado desde la última pasada, la salta sin gastar DeepSeek.
4. DeepSeek extrae los mercados en JSON; cada uno se valida aquí (formatos de
   fecha y hora, valores permitidos, longitudes, eventos ya pasados).
5. Se envían a `POST /api/suggestions` con la cuenta del bot. La API descarta
   los que ya están en el catálogo o ya se sugirieron antes, aunque se
   rechazaran.

## Cuenta del bot

1. Regístrala desde la app (por ejemplo `scraper@deveps.dev`).
2. En el panel, **Usuarios**, cámbiale el rol a **Scraper**.

El scraper comprueba el rol al arrancar y se detiene si no es `SCRAPER`: con
otro rol sus sugerencias no se marcarían como automáticas ni se deduplicarían.

## Instalación en la Orange Pi

```bash
git clone https://github.com/devepsdev/rastrix.git /tmp/rastrix
bash /tmp/rastrix/scraper/scripts/install.sh
```

Después rellena `/opt/apps/rastrix-scraper/.env` y prueba sin enviar nada:

```bash
cd /opt/apps/rastrix-src/scraper
SCRAPER_HOME=/opt/apps/rastrix-scraper /opt/apps/rastrix-scraper/venv/bin/python main.py --dry-run
```

La pasada automática la lanza cron los lunes a las 06:00
(`/etc/cron.d/rastrix-scraper`), con logs en `/opt/apps/rastrix-scraper/logs/`.
Para actualizar el código o las fuentes, vuelve a ejecutar `install.sh`.

## Desarrollo

```bash
cd scraper
python -m venv .venv
.venv/Scripts/pip install -r requirements-dev.txt   # Windows
.venv/Scripts/python -m pytest
```
