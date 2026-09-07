package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.request.ChangePasswordRequest;
import dev.deveps.rastrix.dto.request.UserRequest;
import dev.deveps.rastrix.dto.response.UserResponse;
import dev.deveps.rastrix.entities.Role;
import dev.deveps.rastrix.entities.User;
import dev.deveps.rastrix.exception.DuplicateResourceException;
import dev.deveps.rastrix.exception.InvalidDataException;
import dev.deveps.rastrix.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void createThrowsWhenEmailAlreadyRegistered() {
        UserRequest request = new UserRequest("Ana", "ana@example.com", "password123", null, true);
        when(userRepository.existsByEmail("ana@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.create(request))
                .isInstanceOf(DuplicateResourceException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void createHashesPasswordAndAssignsUserRole() {
        UserRequest request = new UserRequest("Ana", "ana@example.com", "password123", null, true);
        when(userRepository.existsByEmail("ana@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userService.create(request);

        assertThat(response.role()).isEqualTo(Role.USER);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getPassword()).isEqualTo("hashed");
    }

    @Test
    void changePasswordThrowsWhenCurrentPasswordIsWrong() {
        User user = User.builder().id(1L).password("hashed-old").build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed-old")).thenReturn(false);

        ChangePasswordRequest request = new ChangePasswordRequest("wrong", "newPassword123");

        assertThatThrownBy(() -> userService.changePassword(1L, request))
                .isInstanceOf(InvalidDataException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void changePasswordUpdatesHashWhenCurrentPasswordIsCorrect() {
        User user = User.builder().id(1L).password("hashed-old").build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old", "hashed-old")).thenReturn(true);
        when(passwordEncoder.encode("newPassword123")).thenReturn("hashed-new");

        ChangePasswordRequest request = new ChangePasswordRequest("old", "newPassword123");
        userService.changePassword(1L, request);

        assertThat(user.getPassword()).isEqualTo("hashed-new");
        verify(userRepository).save(user);
    }

}
