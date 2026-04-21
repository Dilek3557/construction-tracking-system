package com.dilekkaraca.is_takip_sistemi_backend.stage.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AssignUsersRequest {
    private List<Long> userIds;
}