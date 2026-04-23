package com.dilekkaraca.is_takip_sistemi_backend.common.controller;

import com.dilekkaraca.is_takip_sistemi_backend.common.service.DashboardService;
import com.dilekkaraca.is_takip_sistemi_backend.project.entity.Project;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/critical-projects")
    public List<Project> getCriticalProjects() {
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
    public List<Map<String, Object>> getProjectTypeDistribution() {
        return dashboardService.getProjectTypeDistribution();
    }
}