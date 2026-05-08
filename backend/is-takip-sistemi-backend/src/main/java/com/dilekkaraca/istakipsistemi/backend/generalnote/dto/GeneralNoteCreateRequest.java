package com.dilekkaraca.istakipsistemi.backend.generalnote.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GeneralNoteCreateRequest {

    @NotNull(message = "Kullanıcı id boş olamaz.")
    private Long userId;

    @NotBlank(message = "Genel not mesajı boş olamaz.")
    private String message;
}