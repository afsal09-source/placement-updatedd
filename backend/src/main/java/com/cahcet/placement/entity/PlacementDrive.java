package com.cahcet.placement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "placement_drives")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EntityListeners(AuditingEntityListener.class)
public class PlacementDrive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id")
    private RecruiterProfile recruiter;

    @Column(nullable = false)
    private String companyName;

    @Column(columnDefinition = "TEXT")
    private String jobDescription;

    private String jobRole;
    private String jobType;
    private Double packageOffered;
    private String eligibleDepartments;
    private Double minimumCgpa;
    private LocalDate applicationDeadline;
    private LocalDate driveDate;
    private String location;
    private Integer openings;
    private String requiredSkills;

    @Enumerated(EnumType.STRING)
    private DriveStatus status;

    @OneToMany(mappedBy = "drive", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Application> applications = new ArrayList<>();

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum DriveStatus {
        UPCOMING, ACTIVE, COMPLETED, CANCELLED
    }
}
