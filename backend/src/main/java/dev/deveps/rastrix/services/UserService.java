package dev.deveps.rastrix.services;

import dev.deveps.rastrix.dto.request.UserRequest;
import dev.deveps.rastrix.dto.response.UserResponse;
import dev.deveps.rastrix.entities.Role;

import java.util.List;

public interface UserService {

    UserResponse create(UserRequest request);

    UserResponse update(Long id, UserRequest request);

    UserResponse updateRole(Long id, Role role);

    void delete(Long id);

    UserResponse findById(Long id);

    UserResponse findByUuid(String uuid);

    UserResponse findByEmail(String email);

    List<UserResponse> findAll();

}
