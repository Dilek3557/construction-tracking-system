
package com.dilekkaraca.is_takip_sistemi_backend.exception;

public class ProjectNotFoundException extends RuntimeException {

    public ProjectNotFoundException(Long projectId) {
        super("Proje bulunamadı. Id: " + projectId);
    }
}