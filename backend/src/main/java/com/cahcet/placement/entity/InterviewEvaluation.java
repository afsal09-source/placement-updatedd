package com.cahcet.placement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_evaluations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EntityListeners(AuditingEntityListener.class)
public class InterviewEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    private Integer technicalScore;       // 1-5
    private Integer communicationScore;   // 1-5
    private Integer problemSolvingScore;  // 1-5
    private Integer aptitudeScore;        // 1-5
    private Integer hrScore;              // 1-5

    @Column(columnDefinition = "TEXT")
    private String evaluatorComments;

    private String evaluatedBy;
    private Double overallScore;
    private String recommendation;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime evaluatedAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
