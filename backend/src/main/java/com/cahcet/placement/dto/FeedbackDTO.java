package com.cahcet.placement.dto;

import com.cahcet.placement.entity.Feedback;
import lombok.*;
import java.time.LocalDateTime;

public class FeedbackDTO {

    @Data
    public static class SubmitRequest {
        private Long driveId;
        private Feedback.FeedbackType type;
        private Integer overallRating;
        private Integer interviewProcessRating;
        private Integer companyRating;
        private Integer placementCellRating;
        private String comments;
        private String suggestions;
        private boolean isAnonymous;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class FeedbackResponse {
        private Long id;
        private String submittedBy;
        private String driveTitle;
        private String companyName;
        private Feedback.FeedbackType type;
        private Integer overallRating;
        private Integer interviewProcessRating;
        private Integer companyRating;
        private Integer placementCellRating;
        private String comments;
        private String suggestions;
        private boolean isAnonymous;
        private boolean isApproved;
        private LocalDateTime createdAt;
    }
}
