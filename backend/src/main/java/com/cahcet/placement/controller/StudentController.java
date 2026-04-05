package com.cahcet.placement.controller;

import com.cahcet.placement.dto.ApiResponse;
import com.cahcet.placement.dto.StudentDTO.*;
import com.cahcet.placement.service.PredictionService;
import com.cahcet.placement.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final PredictionService predictionService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ProfileResponse>> getMyProfile() {
        return ResponseEntity.ok(ApiResponse.success(studentService.getMyProfile()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR', 'RECRUITER')")
    public ResponseEntity<ApiResponse<List<ProfileResponse>>> getAllStudents() {
        return ResponseEntity.ok(ApiResponse.success(studentService.getAllStudents()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR', 'RECRUITER')")
    public ResponseEntity<ApiResponse<ProfileResponse>> getStudent(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getStudentProfile(id)));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(@RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated", studentService.updateProfile(request)));
    }

    @PostMapping("/resume")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<String>> uploadResume(@RequestParam("file") MultipartFile file)
            throws IOException {
        String filename = studentService.uploadResume(file);
        return ResponseEntity.ok(ApiResponse.success("Resume uploaded", filename));
    }

    @GetMapping("/predict")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PlacementPrediction>> predictMyPlacement() {
        return ResponseEntity.ok(ApiResponse.success(predictionService.predictForCurrentUser()));
    }

    @GetMapping("/{id}/predict")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public ResponseEntity<ApiResponse<PlacementPrediction>> predictForStudent(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(predictionService.predictForStudent(id)));
    }

    @GetMapping("/{id}/skill-gap")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<SkillGapAnalysis>> getSkillGap(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(predictionService.getSkillGapAnalysis(id)));
    }
}
