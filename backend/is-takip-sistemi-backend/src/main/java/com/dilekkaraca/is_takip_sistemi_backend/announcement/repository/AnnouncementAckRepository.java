package com.dilekkaraca.is_takip_sistemi_backend.announcement.repository;

import com.dilekkaraca.is_takip_sistemi_backend.announcement.entity.AnnouncementAck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnnouncementAckRepository extends JpaRepository<AnnouncementAck, Long> {

    Optional<AnnouncementAck> findByAnnouncementIdAndUserIdAndRevision(
            Long announcementId,
            Long userId,
            Integer revision
    );

    boolean existsByAnnouncementIdAndUserIdAndRevision(
            Long announcementId,
            Long userId,
            Integer revision
    );
}