package com.dilekkaraca.is_takip_sistemi_backend.user.controller;

import com.dilekkaraca.is_takip_sistemi_backend.user.dto.UserCreateRequest;
import com.dilekkaraca.is_takip_sistemi_backend.user.dto.UserResponse;
import com.dilekkaraca.is_takip_sistemi_backend.user.service.UserService;
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
}