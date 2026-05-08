package com.dilekkaraca.istakipsistemi.backend.project.service;

import com.dilekkaraca.istakipsistemi.backend.exception.ProjectNotFoundException;
import com.dilekkaraca.istakipsistemi.backend.exception.UserNotFoundException;
import com.dilekkaraca.istakipsistemi.backend.project.dto.ProjectNoteResponse;
import com.dilekkaraca.istakipsistemi.backend.project.entity.Project;
import com.dilekkaraca.istakipsistemi.backend.project.entity.ProjectNote;
import com.dilekkaraca.istakipsistemi.backend.project.repository.ProjectNoteRepository;
import com.dilekkaraca.istakipsistemi.backend.project.repository.ProjectRepository;
import com.dilekkaraca.istakipsistemi.backend.user.entity.User;
import com.dilekkaraca.istakipsistemi.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectNoteService {

    private final ProjectNoteRepository projectNoteRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProjectNoteResponse addNote(Long projectId, Long userId, String message) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        ProjectNote note = ProjectNote.builder()
                .project(project)
                .author(user)
                .message(message)
                .build();

        ProjectNote saved = projectNoteRepository.save(note);

        return mapToResponse(saved);
    }

    public List<ProjectNoteResponse> getNotesByProject(Long projectId) {
        return projectNoteRepository.findByProjectIdOrderByCreatedAtAsc(projectId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ProjectNoteResponse mapToResponse(ProjectNote note) {
        return ProjectNoteResponse.builder()
                .id(note.getId())
                .projectId(note.getProject().getId())
                .authorUserId(note.getAuthor().getId())
                .authorName(note.getAuthor().getDisplayName())
                .message(note.getMessage())
                .createdAt(note.getCreatedAt())
                .build();
    }
}