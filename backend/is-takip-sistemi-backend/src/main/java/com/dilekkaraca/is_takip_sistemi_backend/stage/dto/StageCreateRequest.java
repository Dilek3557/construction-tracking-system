package com.dilekkaraca.is_takip_sistemi_backend.stage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter


public class StageCreateRequest {

    @NotBlank(message = "Aşama adı boş olamaz.")
    private String name;

    @NotNull(message = "Aşama bitiş tarihi boş olamaz.")
    private LocalDate dueDate;

    private String note;

    private List<Long> userIds;
}

