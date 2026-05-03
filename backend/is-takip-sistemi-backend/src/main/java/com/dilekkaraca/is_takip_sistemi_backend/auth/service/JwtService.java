package com.dilekkaraca.is_takip_sistemi_backend.auth.service;


import com.dilekkaraca.is_takip_sistemi_backend.user.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JwtService {

    private final String SECRET_KEY = "my-secret-key-123";

    public String generateToken(String username) {

        return Jwts.builder()
                .setSubject(username) // token içindeki kullanıcı
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 1 gün
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }
}
