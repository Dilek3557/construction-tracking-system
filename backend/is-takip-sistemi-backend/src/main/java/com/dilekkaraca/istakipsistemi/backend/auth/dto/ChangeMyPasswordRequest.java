package com.dilekkaraca.istakipsistemi.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangeMyPasswordRequest {

    @NotBlank(message = "Eski şifre boş olamaz.")
    private String oldPassword;

    @NotBlank(message = "Yeni şifre boş olamaz.")
    @Size(min = 4, message = "Yeni şifre en az 4 karakter olmalıdır.")
    private String newPassword;
}