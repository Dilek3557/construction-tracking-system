package com.dilekkaraca.is_takip_sistemi_backend.stage.controller;

import com.dilekkaraca.is_takip_sistemi_backend.stage.dto.AssignUsersRequest;
import com.dilekkaraca.is_takip_sistemi_backend.stage.dto.CompleteAssignmentRequest;
import com.dilekkaraca.is_takip_sistemi_backend.stage.dto.StageCreateRequest;
import com.dilekkaraca.is_takip_sistemi_backend.stage.dto.StageResponse;
import com.dilekkaraca.is_takip_sistemi_backend.stage.entity.Stage;
import com.dilekkaraca.is_takip_sistemi_backend.stage.entity.StageAssignment;
import com.dilekkaraca.is_takip_sistemi_backend.stage.service.StageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stages")
@RequiredArgsConstructor
public class StageControlller {
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
    public List<StageAssignment> assignUsersToStage(
            @PathVariable Long stageId,
            @Valid @RequestBody AssignUsersRequest request
    ) {
        return stageService.assignUsersToStage(stageId, request.getUserIds());
    }

    @PutMapping("/{stageId}/complete")
    public StageAssignment completeMyAssignment(
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
