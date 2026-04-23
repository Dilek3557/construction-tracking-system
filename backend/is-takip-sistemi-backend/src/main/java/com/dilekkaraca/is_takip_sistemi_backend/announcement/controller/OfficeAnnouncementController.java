package com.dilekkaraca.is_takip_sistemi_backend.announcement.controller;

import com.dilekkaraca.is_takip_sistemi_backend.announcement.entity.AnnouncementAck;
import com.dilekkaraca.is_takip_sistemi_backend.announcement.entity.OfficeAnnouncement;
import com.dilekkaraca.is_takip_sistemi_backend.announcement.service.AnnouncementAckService;
import com.dilekkaraca.is_takip_sistemi_backend.announcement.service.OfficeAnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/announcements")
@RequiredArgsConstructor
public class OfficeAnnouncementController {

    private final OfficeAnnouncementService officeAnnouncementService;
    private final AnnouncementAckService announcementAckService;

    @GetMapping("/current")
    public Optional<OfficeAnnouncement> getCurrentAnnouncement() {
        return officeAnnouncementService.getCurrentAnnouncement();
    }

    @PutMapping("/current")
    public OfficeAnnouncement saveOrUpdateAnnouncement(
            @RequestParam Long userId,
            @RequestParam String message
    ) {
        return officeAnnouncementService.saveOrUpdateAnnouncement(userId, message);
    }

    @PostMapping("/{announcementId}/ack")
    public AnnouncementAck acknowledgeAnnouncement(
            @PathVariable Long announcementId,
            @RequestParam Long userId
    ) {
        return announcementAckService.acknowledgeAnnouncement(announcementId, userId);
    }

    @GetMapping("/{announcementId}/ack-status")
    public boolean hasUserReadCurrentRevision(
            @PathVariable Long announcementId,
            @RequestParam Long userId
    ) {
        return announcementAckService.hasUserReadCurrentRevision(announcementId, userId);
    }
}