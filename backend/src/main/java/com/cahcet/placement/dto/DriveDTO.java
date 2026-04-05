package com.cahcet.placement.dto;

import com.cahcet.placement.entity.PlacementDrive;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DriveDTO {

    @Data
    public static class CreateRequest {
        @NotBlank
        private String title;

        @NotBlank
        private String companyName;

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
        private PlacementDrive.DriveStatus status;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DriveResponse {
        private Long id;
        private String title;
        private String companyName;
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
        private PlacementDrive.DriveStatus status;
        private Long recruiterId;
        private String recruiterCompany;
        private Integer totalApplications;
        private LocalDateTime createdAt;
    }
}
