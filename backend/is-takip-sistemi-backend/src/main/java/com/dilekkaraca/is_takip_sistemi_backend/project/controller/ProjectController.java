package com.dilekkaraca.is_takip_sistemi_backend.project.controller;

import com.dilekkaraca.is_takip_sistemi_backend.project.dto.ProjectCreateRequest;
import com.dilekkaraca.is_takip_sistemi_backend.project.dto.ProjectResponse;
import com.dilekkaraca.is_takip_sistemi_backend.project.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ProjectResponse createProject(@Valid @RequestBody ProjectCreateRequest request) {
        return projectService.createProject(request);
    }

    @GetMapping
    public List<ProjectResponse> getAllProjects() {
        return projectService.getAllProjects();
    }

    @GetMapping("/active")
    public List<ProjectResponse> getActiveProjects() {
        return projectService.getActiveProjects();
    }

    @GetMapping("/archived")
    public List<ProjectResponse> getArchivedProjects() {
        return projectService.getArchivedProjects();
    }

    @GetMapping("/{id}")
    public ProjectResponse getProjectById(@PathVariable Long id) {
        return projectService.getProjectByIdResponse(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/deliver")
    public ProjectResponse deliverProject(@PathVariable Long id) {
        return projectService.deliverProject(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/archive")
    public ProjectResponse archiveProject(
            @PathVariable Long id,
            @RequestParam boolean archived
    ) {
        return projectService.archiveProject(id, archived);
    }
}