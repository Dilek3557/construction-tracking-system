package com.dilekkaraca.istakipsistemi.backend.auth.dto;

import com.dilekkaraca.istakipsistemi.backend.user.dto.UserResponse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {

    private String token;
    private UserResponse user;
}