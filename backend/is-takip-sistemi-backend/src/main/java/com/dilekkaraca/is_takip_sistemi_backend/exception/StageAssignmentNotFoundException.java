package com.dilekkaraca.is_takip_sistemi_backend.exception;

public class StageAssignmentNotFoundException extends RuntimeException {

    public StageAssignmentNotFoundException(Long stageId, Long userId) {
        super("Bu kullanıcı bu aşamaya atanmış değil. Stage id: " + stageId + ", User id: " + userId);
    }
}