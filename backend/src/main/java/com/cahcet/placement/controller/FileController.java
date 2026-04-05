package com.cahcet.placement.controller;

import com.cahcet.placement.entity.StudentProfile;
import com.cahcet.placement.repository.StudentProfileRepository;
import com.cahcet.placement.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.*;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
@Slf4j
public class FileController {

    private final StudentProfileRepository studentProfileRepository;

    @Value("${app.file.upload-dir:./uploads/resumes}")
    private String uploadDir;

    /**
     * View (inline) or download a student resume.
     * Accessible by: STUDENT (own), RECRUITER, ADMIN, COORDINATOR
     *
     * @param studentId the student profile ID
     * @param download  if true → Content-Disposition: attachment (download)
     *                  if false (default) → Content-Disposition: inline (view in browser)
     */
    @GetMapping("/resume/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN','RECRUITER','COORDINATOR','STUDENT')")
    public ResponseEntity<Resource> serveResume(
            @PathVariable Long studentId,
            @RequestParam(value = "download", defaultValue = "false") boolean download) {

        StudentProfile profile = studentProfileRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));

        if (profile.getResumePath() == null || profile.getResumePath().isBlank()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Path filePath = Paths.get(profile.getResumePath()).toAbsolutePath().normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                log.warn("Resume file not found or not readable for student {}: {}", studentId, filePath);
                return ResponseEntity.notFound().build();
            }

            String originalName = profile.getResumeOriginalName() != null
                ? profile.getResumeOriginalName()
                : "resume.pdf";

            ContentDisposition disposition = download
                ? ContentDisposition.attachment().filename(originalName).build()
                : ContentDisposition.inline().filename(originalName).build();

            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .body(resource);

        } catch (MalformedURLException e) {
            log.error("Malformed URL for resume path: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get resume metadata (filename, availability) without serving the file.
     * Used by the frontend to show "View / Download" buttons.
     */
    @GetMapping("/resume/{studentId}/info")
    @PreAuthorize("hasAnyRole('ADMIN','RECRUITER','COORDINATOR','STUDENT')")
    public ResponseEntity<?> getResumeInfo(@PathVariable Long studentId) {
        StudentProfile profile = studentProfileRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));

        boolean hasResume = profile.getResumePath() != null
            && !profile.getResumePath().isBlank()
            && Files.exists(Paths.get(profile.getResumePath()));

        return ResponseEntity.ok(java.util.Map.of(
            "studentId",       studentId,
            "hasResume",       hasResume,
            "originalName",    profile.getResumeOriginalName() != null ? profile.getResumeOriginalName() : "",
            "viewUrl",         "/api/files/resume/" + studentId,
            "downloadUrl",     "/api/files/resume/" + studentId + "?download=true"
        ));
    }
}
