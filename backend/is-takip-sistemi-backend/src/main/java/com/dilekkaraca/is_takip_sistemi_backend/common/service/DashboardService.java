package com.dilekkaraca.is_takip_sistemi_backend.common.service;

import com.dilekkaraca.is_takip_sistemi_backend.common.dto.ProjectTypeDistributionResponse;
import com.dilekkaraca.is_takip_sistemi_backend.project.dto.ProjectResponse;
import com.dilekkaraca.is_takip_sistemi_backend.project.entity.Project;
import com.dilekkaraca.is_takip_sistemi_backend.project.enums.ProjectStatus;
import com.dilekkaraca.is_takip_sistemi_backend.project.repository.ProjectRepository;
import com.dilekkaraca.is_takip_sistemi_backend.stage.enums.StageStatus;
import com.dilekkaraca.is_takip_sistemi_backend.stage.repository.StageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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