package com.dilekkaraca.is_takip_sistemi_backend.announcement.service;

import com.dilekkaraca.is_takip_sistemi_backend.announcement.entity.AnnouncementAck;
import com.dilekkaraca.is_takip_sistemi_backend.announcement.entity.OfficeAnnouncement;
import com.dilekkaraca.is_takip_sistemi_backend.announcement.repository.AnnouncementAckRepository;
import com.dilekkaraca.is_takip_sistemi_backend.announcement.repository.OfficeAnnouncementRepository;
import com.dilekkaraca.is_takip_sistemi_backend.user.entity.User;
import com.dilekkaraca.is_takip_sistemi_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AnnouncementAckService {

    private final AnnouncementAckRepository announcementAckRepository;
    private final OfficeAnnouncementRepository officeAnnouncementRepository;
    private final UserRepository userRepository;

    @Transactional
    public AnnouncementAck acknowledgeAnnouncement(Long announcementId, Long userId) {

        OfficeAnnouncement announcement = officeAnnouncementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Duyuru bulunamadı. Id: " + announcementId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı. Id: " + userId));

        boolean alreadyExists = announcementAckRepository.existsByAnnouncementIdAndUserIdAndRevision(
                announcement.getId(),
                user.getId(),
                announcement.getRevision()
        );

        if (alreadyExists) {
            throw new IllegalStateException("Bu kullanıcı bu duyurunun güncel sürümünü zaten okumuş.");
        }

        AnnouncementAck ack = AnnouncementAck.builder()
                .announcement(announcement)
                .user(user)
                .revision(announcement.getRevision())
                .build();

        return announcementAckRepository.save(ack);
    }

    public boolean hasUserReadCurrentRevision(Long announcementId, Long userId) {

        OfficeAnnouncement announcement = officeAnnouncementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Duyuru bulunamadı. Id: " + announcementId));

        return announcementAckRepository.existsByAnnouncementIdAndUserIdAndRevision(
                announcement.getId(),
                userId,
                announcement.getRevision()
        );
    }
}