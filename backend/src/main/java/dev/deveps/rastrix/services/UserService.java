package dev.deveps.rastrix.services;

import dev.deveps.rastrix.dto.request.ChangePasswordRequest;
import dev.deveps.rastrix.dto.request.UpdateProfileRequest;
import dev.deveps.rastrix.dto.request.UserRequest;
import dev.deveps.rastrix.dto.response.PageResponse;
import dev.deveps.rastrix.dto.response.UserResponse;
import dev.deveps.rastrix.entities.Role;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface UserService {

    UserResponse create(UserRequest request);

    UserResponse updateProfile(Long id, UpdateProfileRequest request);

    void changePassword(Long id, ChangePasswordRequest request);

    /**
     * Fija una nueva contraseña sin comprobar la actual (para el flujo de
     * "he olvidado mi contraseña", donde por definición no se conoce).
     */
    void overwritePassword(Long id, String newPassword);

    UserResponse updateRole(Long id, Role role);

    void delete(Long id);

    UserResponse findById(Long id);

    UserResponse findByUuid(String uuid);

    UserResponse findByEmail(String email);

    /**
     * Como findByEmail, pero sin lanzar excepción si no existe: para flujos
     * donde no se debe revelar si un email está registrado o no.
     */
    Optional<UserResponse> findByEmailOptional(String email);

    PageResponse<UserResponse> findAll(Pageable pageable);

}
