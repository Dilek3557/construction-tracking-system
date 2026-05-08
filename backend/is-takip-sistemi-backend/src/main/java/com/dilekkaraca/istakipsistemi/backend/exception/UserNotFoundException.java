package com.dilekkaraca.istakipsistemi.backend.exception;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(Long id) {
        super("Kullanıcı bulunamadı. Id: " + id);
    }
}