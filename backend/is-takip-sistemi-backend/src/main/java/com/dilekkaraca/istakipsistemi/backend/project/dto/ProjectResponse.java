package com.dilekkaraca.istakipsistemi.backend.project.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class ProjectResponse {

    private Long id;
    private String companyName;
    private String name;
    private String projectType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private boolean archived;
}