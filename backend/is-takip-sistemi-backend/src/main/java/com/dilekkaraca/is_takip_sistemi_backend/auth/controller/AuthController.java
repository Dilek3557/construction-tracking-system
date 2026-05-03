package com.dilekkaraca.is_takip_sistemi_backend.auth.controller;

import com.dilekkaraca.is_takip_sistemi_backend.auth.dto.LoginRequest;
import com.dilekkaraca.is_takip_sistemi_backend.auth.dto.LoginResponse;
import com.dilekkaraca.is_takip_sistemi_backend.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}