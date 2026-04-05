package com.cahcet.placement.controller;

import com.cahcet.placement.dto.ApiResponse;
import com.cahcet.placement.dto.FeedbackDTO.*;
import com.cahcet.placement.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<ApiResponse<FeedbackResponse>> submitFeedback(@RequestBody SubmitRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Feedback submitted", feedbackService.submitFeedback(request)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getAllFeedback() {
        return ResponseEntity.ok(ApiResponse.success(feedbackService.getAllFeedback()));
    }

    @GetMapping("/approved")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getApprovedFeedback() {
        return ResponseEntity.ok(ApiResponse.success(feedbackService.getApprovedFeedback()));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FeedbackResponse>> approveFeedback(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Feedback approved", feedbackService.approveFeedback(id)));
    }
}
