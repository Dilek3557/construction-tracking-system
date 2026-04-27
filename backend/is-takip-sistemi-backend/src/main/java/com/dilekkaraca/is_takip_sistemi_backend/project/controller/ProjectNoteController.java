package com.dilekkaraca.is_takip_sistemi_backend.project.controller;

import com.dilekkaraca.is_takip_sistemi_backend.project.dto.ProjectNoteCreateRequest;
import com.dilekkaraca.is_takip_sistemi_backend.project.dto.ProjectNoteResponse;
import com.dilekkaraca.is_takip_sistemi_backend.project.entity.ProjectNote;
import com.dilekkaraca.is_takip_sistemi_backend.project.service.ProjectNoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects/{projectId}/notes")
@RequiredArgsConstructor
public class ProjectNoteController {

    private final ProjectNoteService projectNoteService;

    @PostMapping
    public ProjectNoteResponse addNote(
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectNoteCreateRequest request
    ) {
        return projectNoteService.addNote(
                projectId,
                request.getUserId(),
                request.getMessage()
        );
    }

    @GetMapping
    public List<ProjectNoteResponse> getNotesByProject(@PathVariable Long projectId) {
        return projectNoteService.getNotesByProject(projectId);
    }
}