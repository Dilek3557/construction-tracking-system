package com.dilekkaraca.istakipsistemi.backend.project.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectNoteCreateRequest {

    @NotBlank(message = "Not mesajı boş olamaz.")
    private String message;
}