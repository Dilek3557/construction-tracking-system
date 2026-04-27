package com.dilekkaraca.is_takip_sistemi_backend.common.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProjectTypeDistributionResponse {

    private String name;
    private Long count;
}