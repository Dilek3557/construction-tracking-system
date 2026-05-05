package com.dilekkaraca.is_takip_sistemi_backend.stage.repository;

import com.dilekkaraca.is_takip_sistemi_backend.stage.entity.StageAssignment;
import com.dilekkaraca.is_takip_sistemi_backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StageAssignmentRepository extends JpaRepository<StageAssignment, Long> {
    List<StageAssignment> findByStageId(Long stageId);
    List<StageAssignment> findByUser(User user);
    List<StageAssignment> findByUserId(Long userId);

    Optional<StageAssignment> findByStageIdAndUserId(Long stageId, Long userId);

    boolean existsByStageIdAndUserId(Long stageId, Long userId);

    boolean existsByStageIdAndCompletedFalse(Long stageId);

    void deleteByStageId(Long stageId);
}
