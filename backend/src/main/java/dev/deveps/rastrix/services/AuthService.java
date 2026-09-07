package dev.deveps.rastrix.services;

import dev.deveps.rastrix.dto.request.LoginRequest;
import dev.deveps.rastrix.dto.request.ResetPasswordRequest;
import dev.deveps.rastrix.dto.request.UserRequest;
import dev.deveps.rastrix.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(UserRequest request);

    AuthResponse login(LoginRequest request, String clientIp);

    AuthResponse refresh(String refreshToken);

    void logout(String refreshToken);

    void forgotPassword(String email, String clientIp);

    void resetPassword(ResetPasswordRequest request);

}
