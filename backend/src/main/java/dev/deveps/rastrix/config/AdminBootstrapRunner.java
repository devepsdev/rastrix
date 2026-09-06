package dev.deveps.rastrix.config;

import dev.deveps.rastrix.entities.Role;
import dev.deveps.rastrix.entities.User;
import dev.deveps.rastrix.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Crea (o asciende a ADMIN) el usuario administrador indicado por variables de
 * entorno al arrancar la aplicación. Si ADMIN_EMAIL/ADMIN_PASSWORD no se han
 * configurado (caso del entorno local de desarrollo), no hace nada.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminBootstrapRunner implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.name:}")
    private String adminName;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            return;
        }

        userRepository.findByEmail(adminEmail).ifPresentOrElse(
                user -> {
                    if (user.getRole() != Role.ADMIN) {
                        user.setRole(Role.ADMIN);
                        userRepository.save(user);
                        log.info("Usuario {} ascendido a ADMIN", adminEmail);
                    }
                },
                () -> {
                    User admin = User.builder()
                            .name(adminName == null || adminName.isBlank() ? "Administrador" : adminName)
                            .email(adminEmail)
                            .password(passwordEncoder.encode(adminPassword))
                            .active(true)
                            .role(Role.ADMIN)
                            .build();
                    userRepository.save(admin);
                    log.info("Usuario ADMIN {} creado", adminEmail);
                }
        );
    }

}
