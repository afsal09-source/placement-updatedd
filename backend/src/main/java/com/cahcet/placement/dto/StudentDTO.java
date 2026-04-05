package com.cahcet.placement.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class StudentDTO {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProfileResponse {
        private Long id;
        private Long userId;
        private String email;
        private String firstName;
        private String lastName;
        private String rollNumber;
        private String department;
        private String batch;
        private Double cgpa;
        private String phoneNumber;
        private String address;
        private String linkedin;
        private String github;
        private String skills;
        private String resumeOriginalName;
        private boolean isPlaced;
        private String placedCompany;
        private Double placedPackage;
        private LocalDateTime createdAt;
    }

    @Data
    public static class ProfileUpdateRequest {
        private Double cgpa;
        private String phoneNumber;
        private String address;
        private String linkedin;
        private String github;
        private String skills;
        private String department;
        private String batch;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PlacementPrediction {
        private Double placementScore;
        private Double probabilityPercent;
        private String status; // HIGH, MEDIUM, LOW
        private String message;
        private List<String> suggestions;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SkillGapAnalysis {
        private Double avgTechnical;
        private Double avgCommunication;
        private Double avgProblemSolving;
        private Double avgAptitude;
        private Double avgHr;
        private List<String> weakSkills;
        private List<String> suggestions;
    }
}
