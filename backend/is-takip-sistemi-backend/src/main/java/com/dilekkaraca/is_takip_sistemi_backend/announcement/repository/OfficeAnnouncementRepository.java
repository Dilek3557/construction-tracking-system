package com.dilekkaraca.is_takip_sistemi_backend.announcement.repository;

import com.dilekkaraca.is_takip_sistemi_backend.announcement.entity.OfficeAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OfficeAnnouncementRepository extends JpaRepository<OfficeAnnouncement, Long> {

    Optional<OfficeAnnouncement> findTopByOrderByUpdatedAtDesc();
}