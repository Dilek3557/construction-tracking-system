package com.dilekkaraca.istakipsistemi.backend.stage.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class StageResponse {

    private Long id;
    private Long projectId;
    private String name;
    private LocalDate dueDate;
    private String status;
    private String note;
    private List<StageAssignmentResponse> assignedUsers;
}