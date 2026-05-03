package com.dilekkaraca.is_takip_sistemi_backend.auth.dto;

import com.dilekkaraca.is_takip_sistemi_backend.user.dto.UserResponse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {

    private String token;
    private UserResponse user;
}