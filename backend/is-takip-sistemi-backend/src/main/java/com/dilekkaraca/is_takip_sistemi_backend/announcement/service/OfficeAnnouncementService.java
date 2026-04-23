package com.dilekkaraca.is_takip_sistemi_backend.announcement.service;

import com.dilekkaraca.is_takip_sistemi_backend.announcement.entity.OfficeAnnouncement;
import com.dilekkaraca.is_takip_sistemi_backend.announcement.repository.OfficeAnnouncementRepository;
import com.dilekkaraca.is_takip_sistemi_backend.user.entity.User;
import com.dilekkaraca.is_takip_sistemi_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OfficeAnnouncementService {

    private final OfficeAnnouncementRepository officeAnnouncementRepository;
    private final UserRepository userRepository;

    public Optional<OfficeAnnouncement> getCurrentAnnouncement() {
        return officeAnnouncementRepository.findTopByOrderByUpdatedAtDesc();
    }

    @Transactional
    public OfficeAnnouncement saveOrUpdateAnnouncement(Long userId, String message) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı. Id: " + userId));

        Optional<OfficeAnnouncement> optionalAnnouncement =
                officeAnnouncementRepository.findTopByOrderByUpdatedAtDesc();

        if (optionalAnnouncement.isPresent()) {
            OfficeAnnouncement announcement = optionalAnnouncement.get();
            announcement.setMessage(message);
            announcement.setUpdatedBy(user);
            announcement.setRevision(announcement.getRevision() + 1);

            return officeAnnouncementRepository.save(announcement);
        }

        OfficeAnnouncement newAnnouncement = OfficeAnnouncement.builder()
                .message(message)
                .revision(1)
                .createdBy(user)
                .updatedBy(user)
                .build();

        return officeAnnouncementRepository.save(newAnnouncement);
    }
}