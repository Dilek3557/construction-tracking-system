package com.dilekkaraca.istakipsistemi.backend.generalnote.repository;

import com.dilekkaraca.istakipsistemi.backend.generalnote.entity.GeneralNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GeneralNoteRepository extends JpaRepository<GeneralNote, Long> {

    List<GeneralNote> findAllByOrderByCreatedAtDesc();
}