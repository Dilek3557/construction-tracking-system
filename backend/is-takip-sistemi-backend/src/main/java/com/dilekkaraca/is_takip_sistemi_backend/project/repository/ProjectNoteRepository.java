package com.dilekkaraca.is_takip_sistemi_backend.project.repository;

import com.dilekkaraca.is_takip_sistemi_backend.project.entity.ProjectNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectNoteRepository extends JpaRepository<ProjectNote, Long> {

    List<ProjectNote> findByProjectIdOrderByCreatedAtAsc(Long projectId);
}