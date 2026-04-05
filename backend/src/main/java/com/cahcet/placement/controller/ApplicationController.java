package com.cahcet.placement.controller;

import com.cahcet.placement.dto.ApiResponse;
import com.cahcet.placement.dto.ApplicationDTO.*;
import com.cahcet.placement.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/apply")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> apply(@RequestBody ApplyRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Applied successfully", applicationService.applyForDrive(request)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getMyApplications() {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getMyApplications()));
    }

    @GetMapping("/drive/{driveId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'COORDINATOR')")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getApplicationsForDrive(
            @PathVariable Long driveId) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getApplicationsForDrive(driveId)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getAllApplications() {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getAllApplications()));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'COORDINATOR')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateStatus(
            @PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", applicationService.updateStatus(id, request)));
    }

    @PostMapping("/{id}/evaluate")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'COORDINATOR')")
    public ResponseEntity<ApiResponse<Void>> addEvaluation(
            @PathVariable Long id, @RequestBody EvaluationRequest request) {
        applicationService.addEvaluation(id, request);
        return ResponseEntity.ok(ApiResponse.success("Evaluation added", null));
    }
}
