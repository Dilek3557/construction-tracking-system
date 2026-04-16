package com.dilekkaraca.is_takip_sistemi_backend.project.entity;

import com.dilekkaraca.is_takip_sistemi_backend.project.enums.ProjectStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String projectType;

    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status;

    @Builder.Default
    @Column(nullable = false)
    private boolean archived = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

   @PrePersist
   public void prePersist() {
       this.createdAt = LocalDateTime.now();
       this.updatedAt = LocalDateTime.now();
       if (this.status == null) {
           this.status=ProjectStatus.ACTIVE;
       }
   }

    @PreUpdate
    public void preUpdate() {
       this.updatedAt = LocalDateTime.now();
    }
}