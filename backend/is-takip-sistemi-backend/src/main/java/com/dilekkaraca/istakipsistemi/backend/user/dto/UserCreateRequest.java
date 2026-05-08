package com.dilekkaraca.istakipsistemi.backend.user.dto;

import com.dilekkaraca.istakipsistemi.backend.user.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCreateRequest {

    @NotBlank(message = "Kullanıcı adı boş olamaz.")
    private String username;

    @NotBlank(message = "Görünen ad boş olamaz.")
    private String displayName;

    @NotBlank(message = "Şifre boş olamaz.")
    private String password;

    @NotNull(message = "Rol boş olamaz.")
    private UserRole role;
}