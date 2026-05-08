package com.dilekkaraca.istakipsistemi.backend.exception;

public class ProjectNotFoundException extends RuntimeException {

    public ProjectNotFoundException(Long projectId) {
        super("Proje bulunamadı. Id: " + projectId);
    }
}