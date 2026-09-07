package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.request.ChangePasswordRequest;
import dev.deveps.rastrix.dto.request.UpdateProfileRequest;
import dev.deveps.rastrix.dto.request.UserRequest;
import dev.deveps.rastrix.dto.response.PageResponse;
import dev.deveps.rastrix.dto.response.UserResponse;
import dev.deveps.rastrix.entities.Role;
import dev.deveps.rastrix.entities.User;
import dev.deveps.rastrix.exception.DuplicateResourceException;
import dev.deveps.rastrix.exception.InvalidDataException;
import dev.deveps.rastrix.exception.ResourceNotFoundException;
import dev.deveps.rastrix.repositories.UserRepository;
import dev.deveps.rastrix.security.RefreshTokenService;
import dev.deveps.rastrix.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    @Override
    public UserResponse create(UserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Ya existe un usuario registrado con el email: " + request.email());
        }
        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .avatarUrl(request.avatarUrl())
                .active(request.active())
                .role(Role.USER)
                .build();
        return toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse updateProfile(Long id, UpdateProfileRequest request) {
        User user = findEntityById(id);
        if (!user.getEmail().equalsIgnoreCase(request.email()) && userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Ya existe un usuario registrado con el email: " + request.email());
        }
        user.setName(request.name());
        user.setEmail(request.email());
        user.setAvatarUrl(request.avatarUrl());
        return toResponse(userRepository.save(user));
    }

    @Override
    public void changePassword(Long id, ChangePasswordRequest request) {
        User user = findEntityById(id);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new InvalidDataException("La contraseña actual no es correcta");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        // Si alguien más tenía sesión abierta (o un refresh token robado), que
        // deje de servir en cuanto se cambia la contraseña.
        refreshTokenService.revokeAllForUser(id);
    }

    @Override
    public UserResponse updateRole(Long id, Role role) {
        User user = findEntityById(id);
        user.setRole(role);
        return toResponse(userRepository.save(user));
    }

    @Override
    public void delete(Long id) {
        userRepository.delete(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return toResponse(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findByUuid(String uuid) {
        return userRepository.findByUuid(uuid)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("No existe ningún usuario con uuid: " + uuid));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("No existe ningún usuario con email: " + email));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> findAll(Pageable pageable) {
        return PageResponse.from(userRepository.findAll(pageable).map(this::toResponse));
    }

    private User findEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe ningún usuario con id: " + id));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUuid(),
                user.getName(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.isActive(),
                user.getRole(),
                user.getFechaCreacion(),
                user.getFechaActualizacion()
        );
    }

}
