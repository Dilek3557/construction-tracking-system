package com.dilekkaraca.istakipsistemi.backend.common.controller;

import com.dilekkaraca.istakipsistemi.backend.common.dto.ProjectTypeDistributionResponse;
import com.dilekkaraca.istakipsistemi.backend.common.service.DashboardService;
import com.dilekkaraca.istakipsistemi.backend.project.dto.ProjectResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/critical-projects")
    public List<ProjectResponse> getCriticalProjects() {
        return dashboardService.getCriticalProjects();
    }

    @GetMapping("/waiting-approval-stage-count")
    public long getWaitingApprovalStageCount() {
        return dashboardService.getWaitingApprovalStageCount();
    }

    @GetMapping("/delivered-project-count")
    public long getDeliveredProjectCount() {
        return dashboardService.getDeliveredProjectCount();
    }

    @GetMapping("/project-type-distribution")
    public List<ProjectTypeDistributionResponse> getProjectTypeDistribution() {
        return dashboardService.getProjectTypeDistribution();
    }
}