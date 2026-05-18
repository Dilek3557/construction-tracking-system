package com.dilekkaraca.istakipsistemi.backend.generalnote.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GeneralNoteCreateRequest {

    @NotBlank(message = "Genel not mesajı boş olamaz.")
    private String message;
}