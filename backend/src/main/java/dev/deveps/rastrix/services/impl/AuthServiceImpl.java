package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.request.LoginRequest;
import dev.deveps.rastrix.dto.request.ResetPasswordRequest;
import dev.deveps.rastrix.dto.request.UserRequest;
import dev.deveps.rastrix.dto.response.AuthResponse;
import dev.deveps.rastrix.dto.response.UserResponse;
import dev.deveps.rastrix.entities.RefreshToken;
import dev.deveps.rastrix.exception.InvalidDataException;
import dev.deveps.rastrix.security.JwtService;
import dev.deveps.rastrix.security.LoginRateLimiter;
import dev.deveps.rastrix.security.PasswordResetService;
import dev.deveps.rastrix.security.RefreshTokenService;
import dev.deveps.rastrix.services.AuthService;
import dev.deveps.rastrix.services.EmailService;
import dev.deveps.rastrix.services.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final LoginRateLimiter loginRateLimiter;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetService passwordResetService;
    private final EmailService emailService;

    @Override
    public AuthResponse register(UserRequest request) {
        UserResponse user = userService.create(request);
        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse login(LoginRequest request, String clientIp) {
        loginRateLimiter.checkAllowed(request.email(), clientIp);
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (AuthenticationException ex) {
            loginRateLimiter.recordFailure(request.email(), clientIp);
            throw ex;
        }
        loginRateLimiter.recordSuccess(request.email(), clientIp);
        UserResponse user = userService.findByEmail(request.email());
        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse refresh(String refreshToken) {
        RefreshToken consumed = refreshTokenService.consumeAndRotate(refreshToken);
        UserResponse user = userService.findById(consumed.getUserId());
        return buildAuthResponse(user);
    }

    @Override
    public void logout(String refreshToken) {
        refreshTokenService.revoke(refreshToken);
    }

    @Override
    public void forgotPassword(String email, String clientIp) {
        // Reutilizamos el limitador de login con una clave con prefijo propio,
        // para no compartir contador con los intentos de login reales pero sí
        // el mismo mecanismo de "máximo N por email/IP en una ventana".
        loginRateLimiter.checkAllowed("reset:" + email, "reset:" + clientIp);
        loginRateLimiter.recordFailure("reset:" + email, "reset:" + clientIp);

        // Siempre se responde igual, exista o no el email: si reveláramos la
        // diferencia, cualquiera podría usar este endpoint para averiguar qué
        // emails están registrados.
        userService.findByEmailOptional(email).ifPresent(user -> {
            String code = passwordResetService.createResetCode(user.id());
            try {
                emailService.sendPasswordResetCode(user.email(), user.name(), code);
            } catch (Exception ex) {
                log.error("No se ha podido enviar el código de recuperación a {}: {}", user.email(), ex.getMessage());
            }
        });
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        UserResponse user = userService.findByEmailOptional(request.email())
                .orElseThrow(() -> new InvalidDataException("El código no es válido o ha caducado"));
        passwordResetService.verifyCode(user.id(), request.code());
        userService.overwritePassword(user.id(), request.newPassword());
    }

    private AuthResponse buildAuthResponse(UserResponse user) {
        String accessToken = jwtService.generateToken(
                user.email(),
                Map.of("userId", user.id(), "uuid", user.uuid()));
        String refreshToken = refreshTokenService.createRefreshToken(user.id());
        return new AuthResponse(accessToken, refreshToken, "Bearer", user.id(), user.uuid(), user.name(), user.email());
    }

}
