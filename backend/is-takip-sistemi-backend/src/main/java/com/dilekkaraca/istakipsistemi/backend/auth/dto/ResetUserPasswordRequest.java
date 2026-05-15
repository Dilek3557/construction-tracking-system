package com.dilekkaraca.istakipsistemi.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetUserPasswordRequest {

    @NotBlank(message = "Yeni şifre boş olamaz.")
    @Size(min = 3, message = "Yeni şifre en az 4 karakter olmalıdır.")
    private String newPassword;
}