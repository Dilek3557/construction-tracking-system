package com.dilekkaraca.istakipsistemi.backend.auth.controller;

import com.dilekkaraca.istakipsistemi.backend.auth.dto.ChangeMyPasswordRequest;
import com.dilekkaraca.istakipsistemi.backend.auth.dto.LoginRequest;
import com.dilekkaraca.istakipsistemi.backend.auth.dto.LoginResponse;
import com.dilekkaraca.istakipsistemi.backend.auth.service.AuthService;
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
    @PutMapping("/me/password")
    public void changeMyPassword(
            @Valid @RequestBody ChangeMyPasswordRequest request
    ) {
        authService.changeMyPassword(request);
    }
}