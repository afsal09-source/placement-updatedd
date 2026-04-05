package com.cahcet.placement.controller;

import com.cahcet.placement.dto.ApiResponse;
import com.cahcet.placement.dto.StudentDTO.ProfileResponse;
import com.cahcet.placement.entity.PlacementDrive;
import com.cahcet.placement.entity.RecruiterProfile;
import com.cahcet.placement.repository.PlacementDriveRepository;
import com.cahcet.placement.repository.RecruiterProfileRepository;
import com.cahcet.placement.service.StudentService;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/coordinator")
@RequiredArgsConstructor
public class CoordinatorController {

    private final StudentService studentService;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final PlacementDriveRepository driveRepository;

    // ─── Student Details ───────────────────────────────────────────────

    /**
     * Get all students with full details (CGPA, skills, placement status, etc.)
     * GET /api/coordinator/students
     */
    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ProfileResponse>>> getAllStudents() {
        return ResponseEntity.ok(ApiResponse.success(studentService.getAllStudents()));
    }

    /**
     * Get a single student's full profile.
     * GET /api/coordinator/students/{id}
     */
    @GetMapping("/students/{id}")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<ProfileResponse>> getStudent(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getStudentProfile(id)));
    }

    // ─── Company (Recruiter) Details ───────────────────────────────────

    /**
     * Get all registered companies with their recruiter details.
     * GET /api/coordinator/companies
     */
    @GetMapping("/companies")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<CompanyDetailResponse>>> getAllCompanies() {
        List<CompanyDetailResponse> companies = recruiterProfileRepository.findAll()
            .stream()
            .map(this::mapToCompanyDetail)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(companies));
    }

    /**
     * Get a single company with all its drives.
     * GET /api/coordinator/companies/{id}
     */
    @GetMapping("/companies/{id}")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<CompanyDetailResponse>> getCompany(@PathVariable Long id) {
        RecruiterProfile recruiter = recruiterProfileRepository.findById(id)
            .orElseThrow(() -> new com.cahcet.placement.exception.ResourceNotFoundException("Company", id));
        return ResponseEntity.ok(ApiResponse.success(mapToCompanyDetail(recruiter)));
    }

    /**
     * Get all drives with full details — accessible to coordinator.
     * GET /api/coordinator/drives
     */
    @GetMapping("/drives")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<DriveDetailResponse>>> getAllDrives() {
        List<DriveDetailResponse> drives = driveRepository.findAll()
            .stream()
            .map(this::mapToDriveDetail)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(drives));
    }

    // ─── Mapping helpers ───────────────────────────────────────────────

    private CompanyDetailResponse mapToCompanyDetail(RecruiterProfile r) {
        List<DriveDetailResponse> drives = r.getDrives() != null
            ? r.getDrives().stream().map(this::mapToDriveDetail).collect(Collectors.toList())
            : List.of();

        int totalHires = r.getDrives() != null
            ? r.getDrives().stream()
                .mapToInt(d -> d.getApplications() != null
                    ? (int) d.getApplications().stream()
                        .filter(a -> a.getStatus() == com.cahcet.placement.entity.Application.ApplicationStatus.SELECTED)
                        .count()
                    : 0)
                .sum()
            : 0;

        return CompanyDetailResponse.builder()
            .id(r.getId())
            .companyName(r.getCompanyName())
            .recruiterName(r.getUser() != null ? r.getUser().getFullName() : "—")
            .recruiterEmail(r.getUser() != null ? r.getUser().getEmail() : "—")
            .designation(r.getDesignation())
            .industry(r.getIndustry())
            .companySize(r.getCompanySize())
            .companyWebsite(r.getCompanyWebsite())
            .companyDescription(r.getCompanyDescription())
            .phoneNumber(r.getPhoneNumber())
            .averageRating(r.getAverageRating())
            .totalRatings(r.getTotalRatings())
            .totalDrives(drives.size())
            .totalHires(totalHires)
            .drives(drives)
            .registeredAt(r.getCreatedAt())
            .build();
    }

    private DriveDetailResponse mapToDriveDetail(PlacementDrive d) {
        int totalApps = d.getApplications() != null ? d.getApplications().size() : 0;
        int selected  = d.getApplications() != null
            ? (int) d.getApplications().stream()
                .filter(a -> a.getStatus() == com.cahcet.placement.entity.Application.ApplicationStatus.SELECTED)
                .count()
            : 0;

        return DriveDetailResponse.builder()
            .id(d.getId())
            .title(d.getTitle())
            .companyName(d.getCompanyName())
            .jobRole(d.getJobRole())
            .jobType(d.getJobType())
            .packageOffered(d.getPackageOffered())
            .eligibleDepartments(d.getEligibleDepartments())
            .minimumCgpa(d.getMinimumCgpa())
            .requiredSkills(d.getRequiredSkills())
            .applicationDeadline(d.getApplicationDeadline())
            .driveDate(d.getDriveDate())
            .location(d.getLocation())
            .openings(d.getOpenings())
            .status(d.getStatus() != null ? d.getStatus().name() : "UNKNOWN")
            .totalApplications(totalApps)
            .selectedCount(selected)
            .jobDescription(d.getJobDescription())
            .createdAt(d.getCreatedAt())
            .build();
    }

    // ─── Response DTOs ─────────────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CompanyDetailResponse {
        private Long id;
        private String companyName;
        private String recruiterName;
        private String recruiterEmail;
        private String designation;
        private String industry;
        private String companySize;
        private String companyWebsite;
        private String companyDescription;
        private String phoneNumber;
        private Double averageRating;
        private Integer totalRatings;
        private int totalDrives;
        private int totalHires;
        private List<DriveDetailResponse> drives;
        private LocalDateTime registeredAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DriveDetailResponse {
        private Long id;
        private String title;
        private String companyName;
        private String jobRole;
        private String jobType;
        private Double packageOffered;
        private String eligibleDepartments;
        private Double minimumCgpa;
        private String requiredSkills;
        private LocalDate applicationDeadline;
        private LocalDate driveDate;
        private String location;
        private Integer openings;
        private String status;
        private int totalApplications;
        private int selectedCount;
        private String jobDescription;
        private LocalDateTime createdAt;
    }
}
