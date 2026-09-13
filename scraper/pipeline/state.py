import sqlite3
from datetime import datetime
from pathlib import Path


class State:
    """Recuerda el contenido de cada página para no volver a analizar las que no han cambiado."""

    def __init__(self, path: Path | str):
        if str(path) != ":memory:":
            Path(path).parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(str(path))
        self.db.execute(
            "CREATE TABLE IF NOT EXISTS pages ("
            " url TEXT PRIMARY KEY, content_hash TEXT NOT NULL, processed_at TEXT NOT NULL)"
        )

    def is_unchanged(self, url: str, content_hash: str) -> bool:
        row = self.db.execute("SELECT content_hash FROM pages WHERE url = ?", (url,)).fetchone()
        return row is not None and row[0] == content_hash

    def mark_processed(self, url: str, content_hash: str) -> None:
        self.db.execute(
            "INSERT INTO pages (url, content_hash, processed_at) VALUES (?, ?, ?)"
            " ON CONFLICT(url) DO UPDATE SET content_hash = excluded.content_hash, processed_at = excluded.processed_at",
            (url, content_hash, datetime.now().isoformat(timespec="seconds")),
        )
        self.db.commit()
