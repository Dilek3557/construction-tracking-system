package com.dilekkaraca.is_takip_sistemi_backend.stage.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class StageResponse {

    private Long id;
    private Long projectId;
    private String name;
    private LocalDate dueDate;
    private String status;
    private String note;
}