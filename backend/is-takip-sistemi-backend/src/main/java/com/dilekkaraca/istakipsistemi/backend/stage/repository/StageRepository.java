package com.dilekkaraca.istakipsistemi.backend.stage.repository;

import com.dilekkaraca.istakipsistemi.backend.project.entity.Project;
import com.dilekkaraca.istakipsistemi.backend.stage.entity.Stage;
import com.dilekkaraca.istakipsistemi.backend.stage.enums.StageStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StageRepository extends JpaRepository<Stage, Long> {

    List<Stage> findByProject(Project project);

    List<Stage> findByProjectId(Long projectId);

    List<Stage> findByStatus(StageStatus status);

    long countByStatus(StageStatus status);
}