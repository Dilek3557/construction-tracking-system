package com.dilekkaraca.istakipsistemi.backend.auth.service;

import com.dilekkaraca.istakipsistemi.backend.auth.dto.LoginRequest;
import com.dilekkaraca.istakipsistemi.backend.auth.dto.LoginResponse;
import com.dilekkaraca.istakipsistemi.backend.user.dto.UserResponse;
import com.dilekkaraca.istakipsistemi.backend.user.entity.User;
import com.dilekkaraca.istakipsistemi.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalStateException("Kullanıcı adı veya şifre hatalı."));

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash()
        );

        if (!passwordMatches) {
            throw new IllegalStateException("Kullanıcı adı veya şifre hatalı.");
        }

        if (!user.isActive()) {
            throw new IllegalStateException("Bu hesap pasif. Yöneticinizle iletişime geçin.");
        }

        String token = jwtService.generateToken(user.getUsername());

        return LoginResponse.builder()
                .token(token)
                .user(mapToUserResponse(user))
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .role(user.getRole())
                .active(user.isActive())
                .build();
    }
}