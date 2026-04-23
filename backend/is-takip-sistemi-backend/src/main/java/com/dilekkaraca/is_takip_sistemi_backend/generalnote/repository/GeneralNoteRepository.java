package com.dilekkaraca.is_takip_sistemi_backend.generalnote.repository;

import com.dilekkaraca.is_takip_sistemi_backend.generalnote.entity.GeneralNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GeneralNoteRepository extends JpaRepository<GeneralNote, Long> {

    List<GeneralNote> findAllByOrderByCreatedAtDesc();
}