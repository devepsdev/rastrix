#!/usr/bin/env bash
# Pasada semanal del scraper. La lanza cron (deploy/rastrix-scraper.cron).
set -uo pipefail

SCRAPER_HOME="${SCRAPER_HOME:-/opt/apps/rastrix-scraper}"
SCRAPER_CODE="${SCRAPER_CODE:-/opt/apps/rastrix-src/scraper}"
export SCRAPER_HOME

LOG_FILE="$SCRAPER_HOME/logs/weekly_$(date +%Y%m%d).log"
cd "$SCRAPER_CODE"
"$SCRAPER_HOME/venv/bin/python" main.py >> "$LOG_FILE" 2>&1

# Logs de más de tres meses fuera.
find "$SCRAPER_HOME/logs" -name 'weekly_*.log' -mtime +90 -delete
