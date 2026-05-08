package com.dilekkaraca.istakipsistemi.backend.common.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProjectTypeDistributionResponse {

    private String name;
    private Long count;
}