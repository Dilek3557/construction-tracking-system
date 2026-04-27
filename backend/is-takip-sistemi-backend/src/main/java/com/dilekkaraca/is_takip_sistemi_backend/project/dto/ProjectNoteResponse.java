package com.dilekkaraca.is_takip_sistemi_backend.project.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ProjectNoteResponse {

    private Long id;
    private Long projectId;
    private Long authorUserId;
    private String authorName;
    private String message;
    private LocalDateTime createdAt;
}