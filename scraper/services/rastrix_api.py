from dataclasses import dataclass

import requests

from core.logger import logger


class ApiError(Exception):
    pass


@dataclass
class SubmitResult:
    """created: nueva en la bandeja; duplicate: el catálogo o la bandeja ya la tenían; invalid: la API la rechazó."""

    outcome: str
    message: str = ""


class RastrixApi:
    def __init__(self, base_url: str, email: str, password: str, session: requests.Session | None = None):
        self.base_url = base_url
        self.email = email
        self.password = password
        self.session = session or requests.Session()
        self._token: str | None = None

    def login(self) -> None:
        response = self.session.post(
            f"{self.base_url}/api/auth/login",
            json={"email": self.email, "password": self.password},
            timeout=30,
        )
        if response.status_code != 200:
            raise ApiError(f"No se ha podido iniciar sesión en la API ({response.status_code}): {_message(response)}")
        self._token = response.json()["accessToken"]

    def require_scraper_role(self) -> None:
        """
        Con otro rol la API aceptaría igualmente las sugerencias, pero sin marcarlas
        como automáticas, con el tope de 10 pendientes de un usuario y sin
        deduplicar. Es mejor parar en seco que llenar la bandeja de repetidos.
        """
        role = self._request("GET", "/api/users/me").json().get("role")
        if role != "SCRAPER":
            raise ApiError(f"La cuenta {self.email} tiene rol {role}; asígnale el rol SCRAPER desde el panel.")

    def submit_suggestion(self, suggestion: dict) -> SubmitResult:
        response = self._request("POST", "/api/suggestions", json=suggestion)
        if response.status_code == 201:
            return SubmitResult("created")
        if response.status_code == 409:
            return SubmitResult("duplicate", _message(response))
        if response.status_code == 400:
            return SubmitResult("invalid", _message(response))
        raise ApiError(f"Respuesta inesperada al enviar una sugerencia ({response.status_code}): {_message(response)}")

    def _request(self, method: str, path: str, **kwargs) -> requests.Response:
        if self._token is None:
            self.login()
        response = self.session.request(method, f"{self.base_url}{path}", headers=self._auth(), timeout=30, **kwargs)
        if response.status_code == 401:
            # El access token dura 30 minutos: en una pasada larga puede caducar.
            logger.info("Sesión caducada, se vuelve a iniciar sesión")
            self.login()
            response = self.session.request(method, f"{self.base_url}{path}", headers=self._auth(), timeout=30, **kwargs)
        return response

    def _auth(self) -> dict:
        return {"Authorization": f"Bearer {self._token}"}


def _message(response: requests.Response) -> str:
    try:
        body = response.json()
    except ValueError:
        return response.text[:200]
    errors = body.get("errores")
    return f"{body.get('mensaje', '')} {errors}" if errors else str(body.get("mensaje", ""))
