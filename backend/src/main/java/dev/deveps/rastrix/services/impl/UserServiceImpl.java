package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.request.UserRequest;
import dev.deveps.rastrix.dto.response.UserResponse;
import dev.deveps.rastrix.entities.User;
import dev.deveps.rastrix.exception.DuplicateResourceException;
import dev.deveps.rastrix.exception.ResourceNotFoundException;
import dev.deveps.rastrix.repositories.UserRepository;
import dev.deveps.rastrix.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponse create(UserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Ya existe un usuario registrado con el email: " + request.email());
        }
        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(request.password())
                .avatarUrl(request.avatarUrl())
                .active(request.active())
                .build();
        return toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse update(Long id, UserRequest request) {
        User user = findEntityById(id);
        if (!user.getEmail().equalsIgnoreCase(request.email()) && userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Ya existe un usuario registrado con el email: " + request.email());
        }
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(request.password());
        user.setAvatarUrl(request.avatarUrl());
        user.setActive(request.active());
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
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
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
                user.getFechaCreacion(),
                user.getFechaActualizacion()
        );
    }

}
