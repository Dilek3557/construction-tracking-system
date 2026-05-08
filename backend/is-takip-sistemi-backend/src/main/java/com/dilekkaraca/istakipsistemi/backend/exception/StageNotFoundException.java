package com.dilekkaraca.istakipsistemi.backend.exception;

public class StageNotFoundException extends RuntimeException {
    public StageNotFoundException(Long stageId) {
        super("Stage bulunamadı ıd " + stageId);

    }
}
