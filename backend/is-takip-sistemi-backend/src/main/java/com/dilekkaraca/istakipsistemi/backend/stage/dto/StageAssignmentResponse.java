package com.dilekkaraca.istakipsistemi.backend.stage.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class StageAssignmentResponse {

    private Long id;

    private Long stageId;

    private Long userId;

    private String userDisplayName;

    private boolean completed;

    private String completionNote;

    private LocalDateTime completedAt;
}