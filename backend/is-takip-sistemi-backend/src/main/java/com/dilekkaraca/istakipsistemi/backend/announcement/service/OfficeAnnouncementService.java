package com.dilekkaraca.istakipsistemi.backend.announcement.service;

import com.dilekkaraca.istakipsistemi.backend.announcement.dto.OfficeAnnouncementResponse;
import com.dilekkaraca.istakipsistemi.backend.announcement.entity.OfficeAnnouncement;
import com.dilekkaraca.istakipsistemi.backend.announcement.repository.OfficeAnnouncementRepository;
import com.dilekkaraca.istakipsistemi.backend.exception.UserNotFoundException;
import com.dilekkaraca.istakipsistemi.backend.user.entity.User;
import com.dilekkaraca.istakipsistemi.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OfficeAnnouncementService {

    private final OfficeAnnouncementRepository officeAnnouncementRepository;
    private final UserRepository userRepository;

    public Optional<OfficeAnnouncementResponse> getCurrentAnnouncement() {
        return officeAnnouncementRepository.findTopByOrderByUpdatedAtDesc()
                .map(this::mapToResponse);
    }

    @Transactional
    public OfficeAnnouncementResponse saveOrUpdateAnnouncement(Long userId, String message) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Optional<OfficeAnnouncement> optionalAnnouncement =
                officeAnnouncementRepository.findTopByOrderByUpdatedAtDesc();

        if (optionalAnnouncement.isPresent()) {
            OfficeAnnouncement announcement = optionalAnnouncement.get();
            announcement.setMessage(message);
            announcement.setUpdatedBy(user);
            announcement.setRevision(announcement.getRevision() + 1);

            OfficeAnnouncement saved = officeAnnouncementRepository.save(announcement);
            return mapToResponse(saved);
        }

        OfficeAnnouncement newAnnouncement = OfficeAnnouncement.builder()
                .message(message)
                .revision(1)
                .createdBy(user)
                .updatedBy(user)
                .build();

        OfficeAnnouncement saved = officeAnnouncementRepository.save(newAnnouncement);
        return mapToResponse(saved);
    }

    @Transactional
    public OfficeAnnouncementResponse saveOrUpdateAnnouncementForCurrentUser(String message) {

        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Oturum kullanıcısı bulunamadı."));

        return saveOrUpdateAnnouncement(user.getId(), message);
    }

    private OfficeAnnouncementResponse mapToResponse(OfficeAnnouncement announcement) {
        return OfficeAnnouncementResponse.builder()
                .id(announcement.getId())
                .message(announcement.getMessage())
                .revision(announcement.getRevision())
                .createdByUserId(
                        announcement.getCreatedBy() != null ? announcement.getCreatedBy().getId() : null
                )
                .createdByName(
                        announcement.getCreatedBy() != null ? announcement.getCreatedBy().getDisplayName() : null
                )
                .updatedByUserId(
                        announcement.getUpdatedBy() != null ? announcement.getUpdatedBy().getId() : null
                )
                .updatedByName(
                        announcement.getUpdatedBy() != null ? announcement.getUpdatedBy().getDisplayName() : null
                )
                .createdAt(announcement.getCreatedAt())
                .updatedAt(announcement.getUpdatedAt())
                .build();
    }
}