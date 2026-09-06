package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.request.LoginRequest;
import dev.deveps.rastrix.dto.request.UserRequest;
import dev.deveps.rastrix.dto.response.AuthResponse;
import dev.deveps.rastrix.dto.response.UserResponse;
import dev.deveps.rastrix.security.JwtService;
import dev.deveps.rastrix.services.AuthService;
import dev.deveps.rastrix.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public AuthResponse register(UserRequest request) {
        UserResponse user = userService.create(request);
        return buildAuthResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        UserResponse user = userService.findByEmail(request.email());
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(UserResponse user) {
        String token = jwtService.generateToken(
                user.email(),
                Map.of("userId", user.id(), "uuid", user.uuid()));
        return new AuthResponse(token, "Bearer", user.id(), user.uuid(), user.name(), user.email());
    }

}
