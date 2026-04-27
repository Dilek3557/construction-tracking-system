package com.dilekkaraca.is_takip_sistemi_backend.announcement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnnouncementAckRequest {

    @NotNull(message = "Kullanıcı id boş olamaz.")
    private Long userId;
}