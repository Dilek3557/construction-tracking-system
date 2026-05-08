package com.dilekkaraca.istakipsistemi.backend.common.service;

import com.dilekkaraca.istakipsistemi.backend.common.dto.ProjectTypeDistributionResponse;
import com.dilekkaraca.istakipsistemi.backend.project.dto.ProjectResponse;
import com.dilekkaraca.istakipsistemi.backend.project.entity.Project;
import com.dilekkaraca.istakipsistemi.backend.project.enums.ProjectStatus;
import com.dilekkaraca.istakipsistemi.backend.project.repository.ProjectRepository;
import com.dilekkaraca.istakipsistemi.backend.stage.enums.StageStatus;
import com.dilekkaraca.istakipsistemi.backend.stage.repository.StageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final StageRepository stageRepository;

    public List<ProjectResponse> getCriticalProjects() {
        LocalDate threshold = LocalDate.now().plusDays(3);

        return projectRepository.findByEndDateLessThanEqualAndArchivedFalseAndStatusNot(
                        threshold,
                        ProjectStatus.DELIVERED
                )
                .stream()
                .map(this::mapProjectToResponse)
                .toList();
    }

    public long getWaitingApprovalStageCount() {
        return stageRepository.countByStatus(StageStatus.WAITING_APPROVAL);
    }

    public long getDeliveredProjectCount() {
        return projectRepository.countByStatus(ProjectStatus.DELIVERED);
    }


    public List<ProjectTypeDistributionResponse> getProjectTypeDistribution() {

        List<Object[]> results = projectRepository.countProjectsByType();

        return results.stream()
                .map(row -> ProjectTypeDistributionResponse.builder()
                        .name((String) row[0])
                        .count((Long) row[1])
                        .build()
                )
                .toList();
    }

    private ProjectResponse mapProjectToResponse(Project project) {
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