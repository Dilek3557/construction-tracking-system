package com.dilekkaraca.is_takip_sistemi_backend.project.repository;

import com.dilekkaraca.is_takip_sistemi_backend.project.entity.Project;
import com.dilekkaraca.is_takip_sistemi_backend.project.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByArchivedFalse();
    List<Project> findByArchivedTrue();
    List<Project> findByStatus(ProjectStatus status);
}
