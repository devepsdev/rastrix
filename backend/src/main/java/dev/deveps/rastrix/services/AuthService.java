package dev.deveps.rastrix.services;

import dev.deveps.rastrix.dto.request.LoginRequest;
import dev.deveps.rastrix.dto.request.UserRequest;
import dev.deveps.rastrix.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(UserRequest request);

    AuthResponse login(LoginRequest request);

}
