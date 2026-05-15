package com.dilekkaraca.istakipsistemi.backend.config;

import com.dilekkaraca.istakipsistemi.backend.user.entity.User;
import com.dilekkaraca.istakipsistemi.backend.user.enums.UserRole;
import com.dilekkaraca.istakipsistemi.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.initial-admin.username}")
    private String initialAdminUsername;

    @Value("${app.initial-admin.display-name}")
    private String initialAdminDisplayName;

    @Value("${app.initial-admin.password}")
    private String initialAdminPassword;

    @Override
    public void run(String... args) {
        long activeAdminCount = userRepository.countByRoleAndActiveTrue(UserRole.ADMIN);

        if (activeAdminCount > 0) {
            return;
        }

        User admin = User.builder()
                .username(initialAdminUsername)
                .displayName(initialAdminDisplayName)
                .passwordHash(passwordEncoder.encode(initialAdminPassword))
                .role(UserRole.ADMIN)
                .active(true)
                .build();

        userRepository.save(admin);
    }
}