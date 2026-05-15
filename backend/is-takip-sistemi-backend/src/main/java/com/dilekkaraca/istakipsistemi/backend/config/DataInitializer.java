package com.dilekkaraca.istakipsistemi.backend.config;

import com.dilekkaraca.istakipsistemi.backend.user.entity.User;
import com.dilekkaraca.istakipsistemi.backend.user.enums.UserRole;
import com.dilekkaraca.istakipsistemi.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor

public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        long activeAdminCount = userRepository.countByRoleAndActiveTrue(UserRole.ADMIN);

        if (activeAdminCount > 0) {
            return;
        }
        User admin = User.builder()
                .username("Mustafa")
                .displayName("YÖNETİCİ")
                .passwordHash(passwordEncoder.encode("473529"))
                .role(UserRole.ADMIN)
                .active(true)
                .build();
        userRepository.save(admin);
    }
}
