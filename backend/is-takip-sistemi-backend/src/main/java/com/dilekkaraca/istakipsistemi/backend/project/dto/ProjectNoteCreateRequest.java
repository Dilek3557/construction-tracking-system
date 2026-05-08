package com.dilekkaraca.istakipsistemi.backend.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectNoteCreateRequest {

    @NotNull(message = "Kullanıcı id boş olamaz.")
    private Long userId;

    @NotBlank(message = "Not mesajı boş olamaz.")
    private String message;
}