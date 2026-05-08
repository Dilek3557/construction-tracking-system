package com.dilekkaraca.istakipsistemi.backend.announcement.entity;

import com.dilekkaraca.istakipsistemi.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "announcement_acks",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_announcement_ack_announcement_user_revision",
                        columnNames = {
                                "announcement_id",
                                "user_id",
                                "revision"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementAck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // hangi duyuru okundu
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "announcement_id", nullable = false)
    private OfficeAnnouncement announcement;

    // kim okudu
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // duyurunun hangi sürümü okundu
    @Column(nullable = false)
    private Integer revision;

    // ne zaman okudu
    @Column(nullable = false, updatable = false)
    private LocalDateTime readAt;

    @PrePersist
    public void prePersist() {
        this.readAt = LocalDateTime.now();
    }
}