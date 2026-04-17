package com.dilekkaraca.is_takip_sistemi_backend.exception;

public class StageNotFoundException extends RuntimeException {
    public StageNotFoundException(Long stageId) {
        super("Stage bulunamadı ıd " + stageId);

    }
}
