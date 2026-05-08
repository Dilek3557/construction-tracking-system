package com.dilekkaraca.istakipsistemi.backend.announcement.controller;

import com.dilekkaraca.istakipsistemi.backend.announcement.dto.AnnouncementAckResponse;
import com.dilekkaraca.istakipsistemi.backend.announcement.dto.OfficeAnnouncementResponse;
import com.dilekkaraca.istakipsistemi.backend.announcement.dto.OfficeAnnouncementUpdateRequest;
import com.dilekkaraca.istakipsistemi.backend.announcement.service.AnnouncementAckService;
import com.dilekkaraca.istakipsistemi.backend.announcement.service.OfficeAnnouncementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/current")
    public OfficeAnnouncementResponse saveOrUpdateAnnouncement(
            @Valid @RequestBody OfficeAnnouncementUpdateRequest request
    ) {
        return officeAnnouncementService.saveOrUpdateAnnouncementForCurrentUser(
                request.getMessage()
        );
    }

    @PostMapping("/{announcementId}/ack")
    public AnnouncementAckResponse acknowledgeAnnouncement(
            @PathVariable Long announcementId
    ) {
        return announcementAckService.acknowledgeAnnouncementForCurrentUser(announcementId);
    }

    @GetMapping("/{announcementId}/ack-status")
    public boolean hasUserReadCurrentRevision(
            @PathVariable Long announcementId
    ) {
        return announcementAckService.hasCurrentUserReadCurrentRevision(announcementId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{announcementId}/acks")
    public List<AnnouncementAckResponse> getAnnouncementAcks(
            @PathVariable Long announcementId
    ) {
        return announcementAckService.getCurrentRevisionAcks(announcementId);
    }
}