

package com.dilekkaraca.is_takip_sistemi_backend.stage.service;

import com.dilekkaraca.is_takip_sistemi_backend.exception.ProjectNotFoundException;
import com.dilekkaraca.is_takip_sistemi_backend.exception.StageNotFoundException;
import com.dilekkaraca.is_takip_sistemi_backend.exception.UserNotFoundException;
import com.dilekkaraca.is_takip_sistemi_backend.project.entity.Project;
import com.dilekkaraca.is_takip_sistemi_backend.project.repository.ProjectRepository;
import com.dilekkaraca.is_takip_sistemi_backend.stage.dto.StageAssignmentResponse;
import com.dilekkaraca.is_takip_sistemi_backend.stage.dto.StageCreateRequest;
import com.dilekkaraca.is_takip_sistemi_backend.stage.dto.StageResponse;
import com.dilekkaraca.is_takip_sistemi_backend.stage.entity.Stage;
import com.dilekkaraca.is_takip_sistemi_backend.stage.entity.StageAssignment;
import com.dilekkaraca.is_takip_sistemi_backend.stage.enums.StageStatus;
import com.dilekkaraca.is_takip_sistemi_backend.stage.repository.StageAssignmentRepository;
import com.dilekkaraca.is_takip_sistemi_backend.stage.repository.StageRepository;
import com.dilekkaraca.is_takip_sistemi_backend.user.entity.User;
import com.dilekkaraca.is_takip_sistemi_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StageService {

    private final StageRepository stageRepository;
    private final StageAssignmentRepository stageAssignmentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public StageResponse createStage(Long projectId, StageCreateRequest request) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        Stage stage = Stage.builder()
                .project(project)
                .name(request.getName())
                .dueDate(request.getDueDate())
                .note(request.getNote())
                .status(StageStatus.PENDING)
                .build();

        Stage saved = stageRepository.save(stage);

        return mapToResponse(saved);
    }
    public List<StageResponse> getStagesByProjectId(Long projectId) {
        return stageRepository.findByProjectId(projectId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    public Stage getStageById(Long stageId) {
        return stageRepository.findById(stageId)
                .orElseThrow(() -> new StageNotFoundException(stageId));
    }
    public StageResponse getStageByIdResponse(Long stageId) {
        Stage stage = getStageById(stageId);
        return mapToResponse(stage);
    }

    public List<StageAssignmentResponse> assignUsersToStage(Long stageId, List<Long> userIds) {
        Stage stage = getStageById(stageId);

        List<StageAssignment> existingAssignments = stageAssignmentRepository.findByStageId(stageId);
        stageAssignmentRepository.deleteAll(existingAssignments);

        List<StageAssignment> newAssignments = new ArrayList<>();

        for (Long userId : userIds) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(userId));
            StageAssignment assignment = StageAssignment.builder()
                    .stage(stage)
                    .user(user)
                    .completed(false)
                    .build();

            newAssignments.add(assignment);
        }

        stage.setStatus(StageStatus.PENDING);
        stageRepository.save(stage);
        return stageAssignmentRepository.saveAll(newAssignments)
                .stream()
                .map(this::mapAssignmentToResponse)
                .toList();

    }
    public StageAssignmentResponse completeMyAssignment(Long stageId, Long userId, String completionNote) {
        StageAssignment assignment = stageAssignmentRepository.findByStageIdAndUserId(stageId, userId)
                .orElseThrow(() -> new RuntimeException("Bu kullanıcı bu stage'e atanmış değil."));

        if (assignment.isCompleted()) {
            throw new IllegalStateException("Bu görev zaten tamamlanmış.");
        }

        assignment.setCompleted(true);
        assignment.setCompletedAt(LocalDateTime.now());
        assignment.setCompletionNote(completionNote);

        StageAssignment savedAssignment = stageAssignmentRepository.save(assignment);

        boolean hasUnfinishedAssignment = stageAssignmentRepository.existsByStageIdAndCompletedFalse(stageId);

        if (!hasUnfinishedAssignment) {
            Stage stage = assignment.getStage();
            stage.setStatus(StageStatus.WAITING_APPROVAL);
            stageRepository.save(stage);
        }

        return mapAssignmentToResponse(savedAssignment);
    }

    public StageResponse approveStage(Long stageId) {
        Stage stage = getStageById(stageId);

        if (stage.getStatus() != StageStatus.WAITING_APPROVAL) {
            throw new IllegalStateException("Bu stage henüz onay beklemiyor.");
        }

        stage.setStatus(StageStatus.APPROVED);
        Stage saved = stageRepository.save(stage);

        return mapToResponse(saved);
    }
    private StageResponse mapToResponse(Stage stage) {
        return StageResponse.builder()
                .id(stage.getId())
                .projectId(stage.getProject().getId())
                .name(stage.getName())
                .dueDate(stage.getDueDate())
                .status(stage.getStatus().name())
                .note(stage.getNote())
                .build();
    }
    private StageAssignmentResponse mapAssignmentToResponse(StageAssignment assignment) {
        return StageAssignmentResponse.builder()
                .id(assignment.getId())
                .stageId(assignment.getStage().getId())
                .userId(assignment.getUser().getId())
                .userDisplayName(assignment.getUser().getDisplayName())
                .completed(assignment.isCompleted())
                .completionNote(assignment.getCompletionNote())
                .completedAt(assignment.getCompletedAt())
                .build();
    }
}