package com.dilekkaraca.is_takip_sistemi_backend.project.controller;

import com.dilekkaraca.is_takip_sistemi_backend.project.entity.Project;
import com.dilekkaraca.is_takip_sistemi_backend.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public Project createProject(@RequestBody Project project) {
        return projectService.createProject(project);
    }

    @GetMapping
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }

    @GetMapping("/active")
    public List<Project> getActiveProjects() {
        return projectService.getActiveProjects();
    }

    @GetMapping("/archived")
    public List<Project> getArchivedProjects() {
        return projectService.getArchivedProjects();
    }

    @GetMapping("/{id}")
    public Project getProjectById(@PathVariable Long id) {
        return projectService.getProjectById(id);
    }

    @PutMapping("/{id}/deliver")
    public Project deliverProject(@PathVariable Long id) {
        return projectService.deliverProject(id);
    }

    @PutMapping("/{id}/archive")
    public Project archiveProject(
            @PathVariable Long id,
            @RequestParam boolean archived
    ) {
        return projectService.archiveProject(id, archived);
    }
}