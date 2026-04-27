package com.dilekkaraca.is_takip_sistemi_backend.announcement.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class OfficeAnnouncementResponse {

    private Long id;
    private String message;
    private Integer revision;
    private Long createdByUserId;
    private String createdByName;
    private Long updatedByUserId;
    private String updatedByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}