package com.dilekkaraca.is_takip_sistemi_backend.stage.controller;

import com.dilekkaraca.is_takip_sistemi_backend.stage.dto.AssignUsersRequest;
import com.dilekkaraca.is_takip_sistemi_backend.stage.dto.CompleteAssignmentRequest;
import com.dilekkaraca.is_takip_sistemi_backend.stage.entity.Stage;
import com.dilekkaraca.is_takip_sistemi_backend.stage.entity.StageAssignment;
import com.dilekkaraca.is_takip_sistemi_backend.stage.service.StageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stages")
@RequiredArgsConstructor
public class StageControlller {
    private final StageService stageService;

    @PostMapping("/project/{projectId}")
    public Stage addSTageToProject(@PathVariable Long projectId, @RequestBody Stage stage) {
        return stageService.addStageToProject(projectId, stage);
    }

    @GetMapping("/project/{projectId}")
    public List<Stage> getStagesByProjectId(@PathVariable Long projectId) {
        return stageService.getStagesByProjectId(projectId);
    }

    @GetMapping("/{stageId}")
    public Stage getStageById(@PathVariable Long stageId) {
        return stageService.getStageById(stageId);
    }

    @PutMapping("/{stageId}/assign-users")
    public List<StageAssignment> assignUsersToStage(
            @PathVariable Long stageId,
            @RequestBody AssignUsersRequest request
    ) {
        return stageService.assignUsersToStage(stageId, request.getUserIds());
    }

    @PutMapping("/{stageId}/complete")
    public StageAssignment completeMyAssignment(
            @PathVariable Long stageId,
            @RequestBody CompleteAssignmentRequest request
    ) {
        return stageService.completeMyAssignment(
                stageId,
                request.getUserId(),
                request.getCompletionNote()
        );
    }

    @PutMapping("/{stageId}/approve")
    public Stage approveStage(@PathVariable Long stageId) {
        return stageService.approveStage(stageId);
    }

}
