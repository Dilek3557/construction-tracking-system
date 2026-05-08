package com.dilekkaraca.istakipsistemi.backend.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ProjectCreateRequest {

    @NotBlank(message = "Firma adı boş olamaz.")
    private String companyName;

    @NotBlank(message = "Proje adı boş olamaz.")
    private String name;

    @NotBlank(message = "Proje niteliği boş olamaz.")
    private String projectType;

    private LocalDate startDate;

    @NotNull(message = "Bitiş tarihi boş olamaz.")
    private LocalDate endDate;
}