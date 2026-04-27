package com.dilekkaraca.is_takip_sistemi_backend.announcement.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AnnouncementAckResponse {

    private Long id;
    private Long announcementId;
    private Long userId;
    private String userDisplayName;
    private Integer revision;
    private LocalDateTime readAt;
}