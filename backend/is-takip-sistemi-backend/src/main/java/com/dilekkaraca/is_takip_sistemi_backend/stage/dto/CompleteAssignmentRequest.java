package com.dilekkaraca.is_takip_sistemi_backend.stage.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompleteAssignmentRequest {
    private Long userId;
    private String completionNote;
}