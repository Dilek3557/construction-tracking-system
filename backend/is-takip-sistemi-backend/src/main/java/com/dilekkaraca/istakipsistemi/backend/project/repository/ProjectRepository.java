package com.dilekkaraca.istakipsistemi.backend.project.repository;

import com.dilekkaraca.istakipsistemi.backend.project.entity.Project;
import com.dilekkaraca.istakipsistemi.backend.project.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByArchivedFalse();

    List<Project> findByArchivedTrue();

    List<Project> findByStatus(ProjectStatus status);

    List<Project> findByEndDateLessThanEqualAndArchivedFalseAndStatusNot(
            LocalDate date,
            ProjectStatus status
    );

    long countByStatus(ProjectStatus status);

    @Query("""
                SELECT p.projectType, COUNT(p)
                FROM Project p
                GROUP BY p.projectType
            """)
    List<Object[]> countProjectsByType();

}