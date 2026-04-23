package com.dilekkaraca.is_takip_sistemi_backend.project.controller;

import com.dilekkaraca.is_takip_sistemi_backend.project.entity.ProjectNote;
import com.dilekkaraca.is_takip_sistemi_backend.project.service.ProjectNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects/{projectId}/notes")
@RequiredArgsConstructor
public class ProjectNoteController {

    private final ProjectNoteService projectNoteService;

    @PostMapping
    public ProjectNote addNote(
            @PathVariable Long projectId,
            @RequestParam Long userId,
            @RequestParam String message
    ) {
        return projectNoteService.addNote(projectId, userId, message);
    }

    @GetMapping
    public List<ProjectNote> getNotesByProject(@PathVariable Long projectId) {
        return projectNoteService.getNotesByProject(projectId);
    }
}