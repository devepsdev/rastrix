package dev.deveps.rastrix.services;

import dev.deveps.rastrix.dto.request.ChangePasswordRequest;
import dev.deveps.rastrix.dto.request.UpdateProfileRequest;
import dev.deveps.rastrix.dto.request.UserRequest;
import dev.deveps.rastrix.dto.response.PageResponse;
import dev.deveps.rastrix.dto.response.UserResponse;
import dev.deveps.rastrix.entities.Role;
import org.springframework.data.domain.Pageable;

public interface UserService {

    UserResponse create(UserRequest request);

    UserResponse updateProfile(Long id, UpdateProfileRequest request);

    void changePassword(Long id, ChangePasswordRequest request);

    UserResponse updateRole(Long id, Role role);

    void delete(Long id);

    UserResponse findById(Long id);

    UserResponse findByUuid(String uuid);

    UserResponse findByEmail(String email);

    PageResponse<UserResponse> findAll(Pageable pageable);

}
