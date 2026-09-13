package dev.deveps.rastrix.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

/**
 * Responde 401 cuando la petición no trae credenciales válidas (sin token,
 * token manipulado o caducado). Sin esto Spring Security contesta 403 en todos
 * esos casos, y los clientes no pueden distinguir "tu sesión ha caducado,
 * renueva el token" de "no tienes permiso": el refresco automático de la app
 * solo se dispara con un 401.
 */
@Component
public class JsonAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private static final String MESSAGE = "Necesitas iniciar sesión o tu sesión ha caducado";

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(
                "{\"timestamp\":\"" + LocalDateTime.now() + "\",\"status\":401,\"mensaje\":\"" + MESSAGE + "\"}");
    }

}
