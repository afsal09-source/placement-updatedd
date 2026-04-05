package com.cahcet.placement.controller;

import com.cahcet.placement.dto.ApiResponse;
import com.cahcet.placement.dto.DriveDTO.*;
import com.cahcet.placement.entity.PlacementDrive;
import com.cahcet.placement.service.PlacementDriveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/drives")
@RequiredArgsConstructor
public class DriveController {

    private final PlacementDriveService driveService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'COORDINATOR')")
    public ResponseEntity<ApiResponse<DriveResponse>> createDrive(@RequestBody CreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Drive created", driveService.createDrive(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DriveResponse>>> getAllDrives() {
        return ResponseEntity.ok(ApiResponse.success(driveService.getAllDrives()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DriveResponse>> getDriveById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(driveService.getDriveById(id)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<DriveResponse>>> getDrivesByStatus(
            @PathVariable PlacementDrive.DriveStatus status) {
        return ResponseEntity.ok(ApiResponse.success(driveService.getDrivesByStatus(status)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'COORDINATOR')")
    public ResponseEntity<ApiResponse<DriveResponse>> updateDrive(@PathVariable Long id,
                                                                   @RequestBody CreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Drive updated", driveService.updateDrive(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDrive(@PathVariable Long id) {
        driveService.deleteDrive(id);
        return ResponseEntity.ok(ApiResponse.success("Drive deleted", null));
    }
}
