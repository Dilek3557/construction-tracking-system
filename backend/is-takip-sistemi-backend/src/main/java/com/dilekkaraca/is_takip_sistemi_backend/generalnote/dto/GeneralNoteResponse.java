package com.dilekkaraca.is_takip_sistemi_backend.generalnote.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class GeneralNoteResponse {

    private Long id;
    private Long authorUserId;
    private String authorName;
    private String message;
    private LocalDateTime createdAt;
}