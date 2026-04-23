package com.dilekkaraca.is_takip_sistemi_backend.generalnote.entity;

import com.dilekkaraca.is_takip_sistemi_backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "general_notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeneralNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "author_user_id", nullable = false)
    private User author;

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}