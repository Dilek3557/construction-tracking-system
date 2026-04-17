

package com.dilekkaraca.is_takip_sistemi_backend.stage.service;

import com.dilekkaraca.is_takip_sistemi_backend.exception.ProjectNotFoundException;
import com.dilekkaraca.is_takip_sistemi_backend.exception.StageNotFoundException;
import com.dilekkaraca.is_takip_sistemi_backend.project.entity.Project;
import com.dilekkaraca.is_takip_sistemi_backend.project.repository.ProjectRepository;
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

    public Stage addStageToProject(Long projectId, Stage stage) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        stage.setProject(project);
        stage.setStatus(StageStatus.PENDING);

        return stageRepository.save(stage);
    }

    public List<Stage> getStagesByProjectId(Long projectId) {
        return stageRepository.findByProjectId(projectId);
    }

    public Stage getStageById(Long stageId) {
        return stageRepository.findById(stageId)
                .orElseThrow(() -> new StageNotFoundException(stageId));
    }

    public List<StageAssignment> assignUsersToStage(Long stageId, List<Long> userIds) {
        Stage stage = getStageById(stageId);

        List<StageAssignment> existingAssignments = stageAssignmentRepository.findByStageId(stageId);
        stageAssignmentRepository.deleteAll(existingAssignments);

        List<StageAssignment> newAssignments = new ArrayList<>();

        for (Long userId : userIds) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı. Id: " + userId));

            StageAssignment assignment = StageAssignment.builder()
                    .stage(stage)
                    .user(user)
                    .completed(false)
                    .build();

            newAssignments.add(assignment);
        }

        stage.setStatus(StageStatus.PENDING);
        stageRepository.save(stage);

        return stageAssignmentRepository.saveAll(newAssignments);
    }

    public StageAssignment completeMyAssignment(Long stageId, Long userId, String completionNote) {
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

        return savedAssignment;
    }

    public Stage approveStage(Long stageId) {
        Stage stage = getStageById(stageId);

        if (stage.getStatus() != StageStatus.WAITING_APPROVAL) {
            throw new IllegalStateException("Bu stage henüz onay beklemiyor.");
        }

        stage.setStatus(StageStatus.APPROVED);
        return stageRepository.save(stage);
    }
}