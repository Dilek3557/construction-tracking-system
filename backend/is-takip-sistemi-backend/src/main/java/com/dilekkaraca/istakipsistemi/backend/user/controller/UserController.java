package com.dilekkaraca.istakipsistemi.backend.user.controller;

import com.dilekkaraca.istakipsistemi.backend.user.dto.UserActiveUpdateRequest;
import com.dilekkaraca.istakipsistemi.backend.user.dto.UserCreateRequest;
import com.dilekkaraca.istakipsistemi.backend.user.dto.UserResponse;
import com.dilekkaraca.istakipsistemi.backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse createUser(@Valid @RequestBody UserCreateRequest request) {
        return userService.createUser(request);
    }

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateUserActive(
            @PathVariable Long id,
            @RequestBody UserActiveUpdateRequest request
    ) {
        return userService.setUserActive(id, request.isActive());
    }
}