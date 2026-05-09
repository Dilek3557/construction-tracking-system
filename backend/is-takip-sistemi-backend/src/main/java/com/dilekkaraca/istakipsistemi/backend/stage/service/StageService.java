package com.dilekkaraca.istakipsistemi.backend.stage.service;

import com.dilekkaraca.istakipsistemi.backend.exception.ProjectNotFoundException;
import com.dilekkaraca.istakipsistemi.backend.exception.StageAssignmentNotFoundException;
import com.dilekkaraca.istakipsistemi.backend.exception.StageNotFoundException;
import com.dilekkaraca.istakipsistemi.backend.exception.UserNotFoundException;
import com.dilekkaraca.istakipsistemi.backend.project.entity.Project;
import com.dilekkaraca.istakipsistemi.backend.project.enums.ProjectStatus;
import com.dilekkaraca.istakipsistemi.backend.project.repository.ProjectRepository;
import com.dilekkaraca.istakipsistemi.backend.stage.dto.StageAssignmentResponse;
import com.dilekkaraca.istakipsistemi.backend.stage.dto.StageCreateRequest;
import com.dilekkaraca.istakipsistemi.backend.stage.dto.StageResponse;
import com.dilekkaraca.istakipsistemi.backend.stage.entity.Stage;
import com.dilekkaraca.istakipsistemi.backend.stage.entity.StageAssignment;
import com.dilekkaraca.istakipsistemi.backend.stage.enums.StageStatus;
import com.dilekkaraca.istakipsistemi.backend.stage.repository.StageAssignmentRepository;
import com.dilekkaraca.istakipsistemi.backend.stage.repository.StageRepository;
import com.dilekkaraca.istakipsistemi.backend.user.entity.User;
import com.dilekkaraca.istakipsistemi.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StageService {
//kfkfdkdfkfdk
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
        recomputeProjectStatus(project);

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
        Project project = stage.getProject();

        List<StageAssignment> existingAssignments = stageAssignmentRepository.findByStageId(stageId);
        stageAssignmentRepository.deleteAll(existingAssignments);

        List<StageAssignment> newAssignments = new ArrayList<>();

        for (Long userId : userIds) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(userId));
            if (!user.isActive()) {
                throw new IllegalStateException("Pasif kullanıcı aşamaya atanamaz: " + user.getUsername());
            }
            StageAssignment assignment = StageAssignment.builder()
                    .stage(stage)
                    .user(user)
                    .completed(false)
                    .build();

            newAssignments.add(assignment);
        }

        stage.setStatus(StageStatus.PENDING);
        stageRepository.save(stage);
        recomputeProjectStatus(project);
        return stageAssignmentRepository.saveAll(newAssignments)
                .stream()
                .map(this::mapAssignmentToResponse)
                .toList();

    }

    @Transactional
    public void deleteStage(Long stageId) {
        Stage stage = getStageById(stageId);
        Project project = stage.getProject();
        stageAssignmentRepository.deleteByStageId(stageId);
        stageRepository.delete(stage);
        recomputeProjectStatus(project);
    }

    public StageAssignmentResponse completeAssignmentForCurrentUser(Long stageId, String completionNote) {

        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        if (!user.isActive()) {
            throw new IllegalStateException("Pasif hesap görev tamamlayamaz.");
        }

        return completeMyAssignment(stageId, user.getId(), completionNote);
    }

    public StageAssignmentResponse completeMyAssignment(Long stageId, Long userId, String completionNote) {
        StageAssignment assignment = stageAssignmentRepository.findByStageIdAndUserId(stageId, userId)
                .orElseThrow(() -> new StageAssignmentNotFoundException(stageId, userId));
        if (!assignment.getUser().isActive()) {
            throw new IllegalStateException("Pasif kullanıcı görev tamamlayamaz.");
        }
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
            recomputeProjectStatus(stage.getProject());
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
        recomputeProjectStatus(stage.getProject());

        return mapToResponse(saved);
    }

    /**
     * Proje durumunu stage durumlarından türetir.
     * DELIVERED projeler geri çekilmez.
     */
    private void recomputeProjectStatus(Project project) {
        if (project == null) return;
        if (project.getStatus() == ProjectStatus.DELIVERED) return;

        List<Stage> stages = stageRepository.findByProjectId(project.getId());
        if (stages.isEmpty()) {
            project.setStatus(ProjectStatus.ACTIVE);
            projectRepository.save(project);
            return;
        }

        if (stages.stream().anyMatch(s -> s.getStatus() == StageStatus.WAITING_APPROVAL)) {
            project.setStatus(ProjectStatus.WAITING_APPROVAL);
            projectRepository.save(project);
            return;
        }

        boolean allApproved = stages.stream().allMatch(s -> s.getStatus() == StageStatus.APPROVED);
        project.setStatus(allApproved ? ProjectStatus.READY_FOR_DELIVERY : ProjectStatus.ACTIVE);
        projectRepository.save(project);
    }

    private StageResponse mapToResponse(Stage stage) {

        List<StageAssignmentResponse> assignedUsers =
                stageAssignmentRepository.findByStageId(stage.getId())
                        .stream()
                        .map(this::mapAssignmentToResponse)
                        .toList();

        return StageResponse.builder()
                .id(stage.getId())
                .projectId(stage.getProject().getId())
                .name(stage.getName())
                .dueDate(stage.getDueDate())
                .status(stage.getStatus().name())
                .note(stage.getNote())
                .assignedUsers(assignedUsers)
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