package com.dilekkaraca.is_takip_sistemi_backend.common.service;

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

    public List<Project> getCriticalProjects() {
        LocalDate threshold = LocalDate.now().plusDays(3);
        return projectRepository.findByEndDateLessThanEqualAndArchivedFalseAndStatusNot(
                threshold,
                ProjectStatus.DELIVERED
        );
    }

    public long getWaitingApprovalStageCount() {
        return stageRepository.countByStatus(StageStatus.WAITING_APPROVAL);
    }

    public long getDeliveredProjectCount() {
        return projectRepository.countByStatus(ProjectStatus.DELIVERED);
    }

    public List<Map<String, Object>> getProjectTypeDistribution() {

        List<Object[]> results = projectRepository.countProjectsByType();

        List<Map<String, Object>> response = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> item = new HashMap<>();
            item.put("name", row[0]);
            item.put("count", row[1]);
            response.add(item);
        }

        return response;
    }
}