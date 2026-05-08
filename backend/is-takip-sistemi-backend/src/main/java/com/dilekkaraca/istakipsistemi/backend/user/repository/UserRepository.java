package com.dilekkaraca.istakipsistemi.backend.user.repository;

import com.dilekkaraca.istakipsistemi.backend.user.entity.User;
import com.dilekkaraca.istakipsistemi.backend.user.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);
    //aynı username tekrar olmasın

    long countByRoleAndActiveTrue(UserRole role);
}
