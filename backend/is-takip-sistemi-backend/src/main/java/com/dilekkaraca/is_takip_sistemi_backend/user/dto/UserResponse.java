package com.dilekkaraca.is_takip_sistemi_backend.user.dto;

import com.dilekkaraca.is_takip_sistemi_backend.user.enums.UserRole;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponse {

    private Long id;
    private String username;
    private String displayName;
    private UserRole role;
    private boolean active;
}