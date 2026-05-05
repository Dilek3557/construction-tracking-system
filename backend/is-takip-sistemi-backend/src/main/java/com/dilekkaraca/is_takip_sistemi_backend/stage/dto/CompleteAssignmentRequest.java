package com.dilekkaraca.is_takip_sistemi_backend.stage.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompleteAssignmentRequest {


    private String completionNote;
}