package com.dilekkaraca.is_takip_sistemi_backend.stage.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AssignUsersRequest {

    @NotEmpty(message = "En az bir kullanıcı seçilmelidir.")
    private List<Long> userIds;
}