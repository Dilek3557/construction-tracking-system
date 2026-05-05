package com.dilekkaraca.is_takip_sistemi_backend.announcement.service;

import com.dilekkaraca.is_takip_sistemi_backend.announcement.dto.AnnouncementAckResponse;
import com.dilekkaraca.is_takip_sistemi_backend.announcement.entity.AnnouncementAck;
import com.dilekkaraca.is_takip_sistemi_backend.announcement.entity.OfficeAnnouncement;
import com.dilekkaraca.is_takip_sistemi_backend.announcement.repository.AnnouncementAckRepository;
import com.dilekkaraca.is_takip_sistemi_backend.announcement.repository.OfficeAnnouncementRepository;
import com.dilekkaraca.is_takip_sistemi_backend.user.entity.User;
import com.dilekkaraca.is_takip_sistemi_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnouncementAckService {

    private final AnnouncementAckRepository announcementAckRepository;
    private final OfficeAnnouncementRepository officeAnnouncementRepository;
    private final UserRepository userRepository;

    @Transactional
    public AnnouncementAckResponse acknowledgeAnnouncement(Long announcementId, Long userId) {

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

        AnnouncementAck saved = announcementAckRepository.save(ack);

        return mapToResponse(saved);
    }
    @Transactional
    public AnnouncementAckResponse acknowledgeAnnouncementForCurrentUser(Long announcementId) {

        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Oturum kullanıcısı bulunamadı."));

        return acknowledgeAnnouncement(announcementId, user.getId());
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
    public boolean hasCurrentUserReadCurrentRevision(Long announcementId) {

        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Oturum kullanıcısı bulunamadı."));

        return hasUserReadCurrentRevision(announcementId, user.getId());
    }

    private AnnouncementAckResponse mapToResponse(AnnouncementAck ack) {
        return AnnouncementAckResponse.builder()
                .id(ack.getId())
                .announcementId(ack.getAnnouncement().getId())
                .userId(ack.getUser().getId())
                .userDisplayName(ack.getUser().getDisplayName())
                .revision(ack.getRevision())
                .readAt(ack.getReadAt())
                .build();
    }
    public List<AnnouncementAckResponse> getCurrentRevisionAcks(Long announcementId) {

        OfficeAnnouncement announcement = officeAnnouncementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Duyuru bulunamadı. Id: " + announcementId));

        return announcementAckRepository
                .findByAnnouncementIdAndRevisionOrderByReadAtDesc(
                        announcement.getId(),
                        announcement.getRevision()
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
}