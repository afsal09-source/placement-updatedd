package com.cahcet.placement.dto;

import com.cahcet.placement.entity.Application;
import lombok.*;

import java.time.LocalDateTime;

public class ApplicationDTO {

    @Data
    public static class ApplyRequest {
        private Long driveId;
        private String coverLetter;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ApplicationResponse {
        private Long id;
        private Long driveId;
        private String driveTitle;
        private String companyName;
        private Long studentId;
        private String studentName;
        private String rollNumber;
        private String department;
        private Double cgpa;
        private Application.ApplicationStatus status;
        private String coverLetter;
        private String resumeSnapshot;
        private String resumeOriginalName;
        private LocalDateTime appliedAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class StatusUpdateRequest {
        private Application.ApplicationStatus status;
        private String remarks;
    }

    @Data
    public static class EvaluationRequest {
        private Integer technicalScore;
        private Integer communicationScore;
        private Integer problemSolvingScore;
        private Integer aptitudeScore;
        private Integer hrScore;
        private String evaluatorComments;
        private String recommendation;
    }
}
