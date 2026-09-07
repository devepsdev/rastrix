package dev.deveps.rastrix.security;

import dev.deveps.rastrix.entities.PasswordResetToken;
import dev.deveps.rastrix.exception.InvalidDataException;
import dev.deveps.rastrix.repositories.PasswordResetTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    private PasswordResetService passwordResetService;

    @BeforeEach
    void setUp() {
        passwordResetService = new PasswordResetService(passwordResetTokenRepository);
        ReflectionTestUtils.setField(passwordResetService, "expirationMinutes", 15L);
    }

    @Test
    void createResetCodeGeneratesSixDigitCodeAndClearsPreviousOnes() {
        ArgumentCaptor<PasswordResetToken> captor = ArgumentCaptor.forClass(PasswordResetToken.class);
        when(passwordResetTokenRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));

        String code = passwordResetService.createResetCode(1L);

        assertThat(code).matches("\\d{6}");
        verify(passwordResetTokenRepository).deleteByUserId(1L);
        assertThat(captor.getValue().getCodeHash()).isEqualTo(HashUtils.sha256(code));
        assertThat(captor.getValue().isUsed()).isFalse();
        assertThat(captor.getValue().getAttempts()).isZero();
    }

    @Test
    void verifyCodeSucceedsWithTheCorrectCode() {
        ArgumentCaptor<PasswordResetToken> captor = ArgumentCaptor.forClass(PasswordResetToken.class);
        when(passwordResetTokenRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));
        String code = passwordResetService.createResetCode(1L);
        PasswordResetToken stored = captor.getValue();
        when(passwordResetTokenRepository.findByUserIdAndUsedFalse(1L)).thenReturn(Optional.of(stored));

        assertThatCode(() -> passwordResetService.verifyCode(1L, code)).doesNotThrowAnyException();
        assertThat(stored.isUsed()).isTrue();
    }

    @Test
    void verifyCodeFailsWithAWrongCodeAndIncrementsAttempts() {
        PasswordResetToken stored = activeToken("123456", 0);
        when(passwordResetTokenRepository.findByUserIdAndUsedFalse(1L)).thenReturn(Optional.of(stored));

        assertThatThrownBy(() -> passwordResetService.verifyCode(1L, "000000"))
                .isInstanceOf(InvalidDataException.class);

        assertThat(stored.getAttempts()).isEqualTo(1);
    }

    @Test
    void verifyCodeFailsWhenExpired() {
        PasswordResetToken stored = PasswordResetToken.builder()
                .userId(1L)
                .codeHash(HashUtils.sha256("123456"))
                .expiresAt(LocalDateTime.now().minusMinutes(1))
                .used(false)
                .attempts(0)
                .build();
        when(passwordResetTokenRepository.findByUserIdAndUsedFalse(1L)).thenReturn(Optional.of(stored));

        assertThatThrownBy(() -> passwordResetService.verifyCode(1L, "123456"))
                .isInstanceOf(InvalidDataException.class);

        verify(passwordResetTokenRepository).delete(stored);
    }

    @Test
    void verifyCodeFailsAfterMaxAttemptsReached() {
        PasswordResetToken stored = activeToken("123456", 5);
        when(passwordResetTokenRepository.findByUserIdAndUsedFalse(1L)).thenReturn(Optional.of(stored));

        assertThatThrownBy(() -> passwordResetService.verifyCode(1L, "123456"))
                .isInstanceOf(InvalidDataException.class);

        verify(passwordResetTokenRepository).delete(stored);
    }

    @Test
    void verifyCodeFailsWhenThereIsNoActiveCode() {
        when(passwordResetTokenRepository.findByUserIdAndUsedFalse(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> passwordResetService.verifyCode(1L, "123456"))
                .isInstanceOf(InvalidDataException.class);
    }

    private PasswordResetToken activeToken(String code, int attempts) {
        return PasswordResetToken.builder()
                .userId(1L)
                .codeHash(HashUtils.sha256(code))
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .used(false)
                .attempts(attempts)
                .build();
    }

}
