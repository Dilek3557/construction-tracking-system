package com.dilekkaraca.is_takip_sistemi_backend.announcement.controller;

import com.dilekkaraca.is_takip_sistemi_backend.announcement.dto.AnnouncementAckRequest;
import com.dilekkaraca.is_takip_sistemi_backend.announcement.dto.AnnouncementAckResponse;
import com.dilekkaraca.is_takip_sistemi_backend.announcement.dto.OfficeAnnouncementResponse;
import com.dilekkaraca.is_takip_sistemi_backend.announcement.dto.OfficeAnnouncementUpdateRequest;
import com.dilekkaraca.is_takip_sistemi_backend.announcement.entity.AnnouncementAck;
import com.dilekkaraca.is_takip_sistemi_backend.announcement.entity.OfficeAnnouncement;
import com.dilekkaraca.is_takip_sistemi_backend.announcement.service.AnnouncementAckService;
import com.dilekkaraca.is_takip_sistemi_backend.announcement.service.OfficeAnnouncementService;
import jakarta.validation.Valid;
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
    public Optional<OfficeAnnouncementResponse> getCurrentAnnouncement() {
        return officeAnnouncementService.getCurrentAnnouncement();
    }

    @PutMapping("/current")
    public OfficeAnnouncementResponse saveOrUpdateAnnouncement(
            @Valid @RequestBody OfficeAnnouncementUpdateRequest request
    ) {
        return officeAnnouncementService.saveOrUpdateAnnouncement(
                request.getUserId(),
                request.getMessage()
        );
    }

    @PostMapping("/{announcementId}/ack")
    public AnnouncementAckResponse acknowledgeAnnouncement(
            @PathVariable Long announcementId,
            @Valid @RequestBody AnnouncementAckRequest request
    ) {
        return announcementAckService.acknowledgeAnnouncement(
                announcementId,
                request.getUserId()
        );
    }

    @GetMapping("/{announcementId}/ack-status")
    public boolean hasUserReadCurrentRevision(
            @PathVariable Long announcementId,
            @RequestParam Long userId
    ) {
        return announcementAckService.hasUserReadCurrentRevision(announcementId, userId);
    }
}