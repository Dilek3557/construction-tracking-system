package com.dilekkaraca.is_takip_sistemi_backend.stage.controller;

import com.dilekkaraca.is_takip_sistemi_backend.stage.dto.*;
import com.dilekkaraca.is_takip_sistemi_backend.stage.entity.StageAssignment;
import com.dilekkaraca.is_takip_sistemi_backend.stage.service.StageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stages")
@RequiredArgsConstructor

public class StageController {
    private final StageService stageService;

    @PostMapping("/project/{projectId}")
    public StageResponse createStage(
            @PathVariable Long projectId,
            @Valid @RequestBody StageCreateRequest request
    ) {
        return stageService.createStage(projectId, request);
    }

    @GetMapping("/project/{projectId}")
    public List<StageResponse> getStagesByProjectId(@PathVariable Long projectId) {
        return stageService.getStagesByProjectId(projectId);
    }

    @GetMapping("/{stageId}")
    public StageResponse getStageById(@PathVariable Long stageId) {
        return stageService.getStageByIdResponse(stageId);
    }

    @PutMapping("/{stageId}/assign-users")
    public List<StageAssignmentResponse> assignUsersToStage(
            @PathVariable Long stageId,
            @Valid @RequestBody AssignUsersRequest request
    ) {
        return stageService.assignUsersToStage(stageId, request.getUserIds());
    }

    @PutMapping("/{stageId}/complete")
    public StageAssignmentResponse completeMyAssignment(
            @PathVariable Long stageId,
            @Valid @RequestBody CompleteAssignmentRequest request
    ) {
        return stageService.completeMyAssignment(
                stageId,
                request.getUserId(),
                request.getCompletionNote()
        );
    }

    @PutMapping("/{stageId}/approve")
    public StageResponse approveStage(@PathVariable Long stageId) {
        return stageService.approveStage(stageId);
    }
}
