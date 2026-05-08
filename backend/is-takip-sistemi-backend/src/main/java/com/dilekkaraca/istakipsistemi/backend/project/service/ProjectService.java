package com.dilekkaraca.istakipsistemi.backend.project.service;

import com.dilekkaraca.istakipsistemi.backend.exception.ProjectNotFoundException;
import com.dilekkaraca.istakipsistemi.backend.project.dto.ProjectCreateRequest;
import com.dilekkaraca.istakipsistemi.backend.project.dto.ProjectResponse;
import com.dilekkaraca.istakipsistemi.backend.project.entity.Project;
import com.dilekkaraca.istakipsistemi.backend.project.enums.ProjectStatus;
import com.dilekkaraca.istakipsistemi.backend.project.repository.ProjectRepository;
import com.dilekkaraca.istakipsistemi.backend.stage.enums.StageStatus;
import com.dilekkaraca.istakipsistemi.backend.stage.repository.StageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final StageRepository stageRepository;

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

        var stages = stageRepository.findByProjectId(project.getId());
        // Boş stream'de allMatch(true) Java'da true döner; önce açıkça kontrol et.
        if (stages.isEmpty()) {
            throw new IllegalStateException("Bu proje henüz teslime hazır değil.");
        }
        boolean allApproved = stages.stream().allMatch(s -> s.getStatus() == StageStatus.APPROVED);
        if (!allApproved) {
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