package com.dilekkaraca.is_takip_sistemi_backend.project.service;

import com.dilekkaraca.is_takip_sistemi_backend.exception.ProjectNotFoundException;
import com.dilekkaraca.is_takip_sistemi_backend.project.dto.ProjectCreateRequest;
import com.dilekkaraca.is_takip_sistemi_backend.project.dto.ProjectResponse;
import com.dilekkaraca.is_takip_sistemi_backend.project.entity.Project;
import com.dilekkaraca.is_takip_sistemi_backend.project.enums.ProjectStatus;
import com.dilekkaraca.is_takip_sistemi_backend.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectResponse createProject(ProjectCreateRequest request) {

        Project project = Project.builder()
                .companyName(request.getCompanyName())
                .name(request.getName())
                .projectType(request.getProjectType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(ProjectStatus.ACTIVE)
                .archived(false)
                .build();

        Project saved = projectRepository.save(project);

        return mapToResponse(saved);
    }
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ProjectResponse> getActiveProjects() {
        return projectRepository.findByArchivedFalse()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ProjectResponse> getArchivedProjects() {
        return projectRepository.findByArchivedTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));
    }
    public ProjectResponse getProjectByIdResponse(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));

        return mapToResponse(project);
    }

    @Transactional
    public ProjectResponse deliverProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));

        if (project.getStatus() != ProjectStatus.READY_FOR_DELIVERY) {
            throw new IllegalStateException("Bu proje henüz teslime hazır değil.");
        }

        project.setStatus(ProjectStatus.DELIVERED);
        Project saved = projectRepository.save(project);

        return mapToResponse(saved);
    }

    @Transactional
    public ProjectResponse archiveProject(Long id, boolean archived) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));

        if (archived && project.getStatus() != ProjectStatus.DELIVERED) {
            throw new IllegalStateException("Sadece teslim edilmiş projeler arşive alınabilir.");
        }

        project.setArchived(archived);
        Project saved = projectRepository.save(project);

        return mapToResponse(saved);
    }
    private ProjectResponse mapToResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .companyName(project.getCompanyName())
                .name(project.getName())
                .projectType(project.getProjectType())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .status(project.getStatus().name())
                .archived(project.isArchived())
                .build();
    }
}