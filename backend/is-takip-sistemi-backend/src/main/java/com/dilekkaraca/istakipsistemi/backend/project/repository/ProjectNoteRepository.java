package com.dilekkaraca.istakipsistemi.backend.project.repository;

import com.dilekkaraca.istakipsistemi.backend.project.entity.ProjectNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectNoteRepository extends JpaRepository<ProjectNote, Long> {

    List<ProjectNote> findByProjectIdOrderByCreatedAtAsc(Long projectId);
}