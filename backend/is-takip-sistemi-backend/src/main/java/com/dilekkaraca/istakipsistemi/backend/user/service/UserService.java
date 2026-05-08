package com.dilekkaraca.istakipsistemi.backend.user.service;


import com.dilekkaraca.istakipsistemi.backend.exception.UserNotFoundException;
import com.dilekkaraca.istakipsistemi.backend.user.dto.UserCreateRequest;
import com.dilekkaraca.istakipsistemi.backend.user.dto.UserResponse;
import com.dilekkaraca.istakipsistemi.backend.user.entity.User;
import com.dilekkaraca.istakipsistemi.backend.user.enums.UserRole;
import com.dilekkaraca.istakipsistemi.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor

public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse createUser(UserCreateRequest request) {
        User user = User.builder()
                .username(request.getUsername())
                .displayName(request.getDisplayName())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(true)
                .build();
        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public UserResponse setUserActive(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!active && user.getUsername().equals(currentUsername)) {
            throw new IllegalStateException("Kendi hesabınızı pasifleştiremezsiniz.");
        }

        if (!active
                && user.getRole() == UserRole.ADMIN
                && user.isActive()
                && userRepository.countByRoleAndActiveTrue(UserRole.ADMIN) <= 1) {
            throw new IllegalStateException("Son aktif yönetici pasifleştirilemez.");
        }

        user.setActive(active);
        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .role(user.getRole())
                .active(user.isActive())
                .build();
    }

}
