package com.dilekkaraca.istakipsistemi.backend.announcement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OfficeAnnouncementUpdateRequest {


    @NotBlank(message = "Duyuru mesajı boş olamaz.")
    private String message;
}