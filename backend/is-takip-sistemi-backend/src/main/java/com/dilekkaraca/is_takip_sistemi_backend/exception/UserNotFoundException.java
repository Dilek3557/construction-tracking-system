package com.dilekkaraca.is_takip_sistemi_backend.exception;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(Long id) {
        super("Kullanıcı bulunamadı. Id: " + id);
    }
}