package com.cahcet.placement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EntityListeners(AuditingEntityListener.class)
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by", nullable = false)
    private User submittedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drive_id")
    private PlacementDrive drive;

    @Enumerated(EnumType.STRING)
    private FeedbackType type;

    private Integer overallRating;         // 1-5
    private Integer interviewProcessRating; // 1-5
    private Integer companyRating;          // 1-5
    private Integer placementCellRating;    // 1-5

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(columnDefinition = "TEXT")
    private String suggestions;

    private boolean isAnonymous;
    private boolean isApproved;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public enum FeedbackType {
        COMPANY, PLACEMENT_CELL, INTERVIEW_PROCESS, GENERAL
    }
}
