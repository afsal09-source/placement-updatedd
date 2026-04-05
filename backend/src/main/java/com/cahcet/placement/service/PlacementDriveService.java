package com.cahcet.placement.service;

import com.cahcet.placement.dto.DriveDTO.*;
import com.cahcet.placement.entity.*;
import com.cahcet.placement.exception.*;
import com.cahcet.placement.repository.*;
import com.cahcet.placement.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PlacementDriveService {

    private final PlacementDriveRepository driveRepository;
    private final RecruiterProfileRepository recruiterRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public DriveResponse createDrive(CreateRequest request) {
        PlacementDrive drive = PlacementDrive.builder()
            .title(request.getTitle())
            .companyName(request.getCompanyName())
            .jobDescription(request.getJobDescription())
            .jobRole(request.getJobRole())
            .jobType(request.getJobType())
            .packageOffered(request.getPackageOffered())
            .eligibleDepartments(request.getEligibleDepartments())
            .minimumCgpa(request.getMinimumCgpa())
            .applicationDeadline(request.getApplicationDeadline())
            .driveDate(request.getDriveDate())
            .location(request.getLocation())
            .openings(request.getOpenings())
            .requiredSkills(request.getRequiredSkills())
            .status(request.getStatus() != null ? request.getStatus() : PlacementDrive.DriveStatus.UPCOMING)
            .build();

        // Attach recruiter if logged in as one
        try {
            UserDetailsImpl currentUser = (UserDetailsImpl) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
            if ("RECRUITER".equals(currentUser.getRole())) {
                recruiterRepository.findByUserId(currentUser.getId())
                    .ifPresent(drive::setRecruiter);
            }
        } catch (Exception ignored) {}

        drive = driveRepository.save(drive);

        // Notify all students (in-app)
        notificationService.notifyAllStudents(
            "New Drive: " + request.getCompanyName(),
            request.getCompanyName() + " is hiring! Apply before " + request.getApplicationDeadline(),
            Notification.NotificationType.NEW_DRIVE
        );

        // Send new-drive email to all students (async)
        final PlacementDrive savedDrive = drive;
        userRepository.findByRole(com.cahcet.placement.entity.User.Role.STUDENT)
            .forEach(student -> emailService.sendNewDriveNotification(
                student.getEmail(),
                student.getFirstName(),
                savedDrive.getCompanyName(),
                savedDrive.getJobRole(),
                savedDrive.getPackageOffered() != null ? savedDrive.getPackageOffered().toString() : null,
                savedDrive.getApplicationDeadline() != null ? savedDrive.getApplicationDeadline().toString() : null,
                savedDrive.getDriveDate() != null ? savedDrive.getDriveDate().toString() : null
            ));

        return mapToResponse(drive);
    }

    @Transactional(readOnly = true)
    public List<DriveResponse> getAllDrives() {
        return driveRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DriveResponse> getDrivesByStatus(PlacementDrive.DriveStatus status) {
        return driveRepository.findByStatus(status).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DriveResponse getDriveById(Long id) {
        return mapToResponse(driveRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Drive", id)));
    }

    public DriveResponse updateDrive(Long id, CreateRequest request) {
        PlacementDrive drive = driveRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Drive", id));

        drive.setTitle(request.getTitle());
        drive.setCompanyName(request.getCompanyName());
        drive.setJobDescription(request.getJobDescription());
        drive.setJobRole(request.getJobRole());
        drive.setJobType(request.getJobType());
        drive.setPackageOffered(request.getPackageOffered());
        drive.setEligibleDepartments(request.getEligibleDepartments());
        drive.setMinimumCgpa(request.getMinimumCgpa());
        drive.setApplicationDeadline(request.getApplicationDeadline());
        drive.setDriveDate(request.getDriveDate());
        drive.setLocation(request.getLocation());
        drive.setOpenings(request.getOpenings());
        drive.setRequiredSkills(request.getRequiredSkills());
        if (request.getStatus() != null) drive.setStatus(request.getStatus());

        return mapToResponse(driveRepository.save(drive));
    }

    public void deleteDrive(Long id) {
        if (!driveRepository.existsById(id)) throw new ResourceNotFoundException("Drive", id);
        driveRepository.deleteById(id);
    }

    private DriveResponse mapToResponse(PlacementDrive drive) {
        return DriveResponse.builder()
            .id(drive.getId())
            .title(drive.getTitle())
            .companyName(drive.getCompanyName())
            .jobDescription(drive.getJobDescription())
            .jobRole(drive.getJobRole())
            .jobType(drive.getJobType())
            .packageOffered(drive.getPackageOffered())
            .eligibleDepartments(drive.getEligibleDepartments())
            .minimumCgpa(drive.getMinimumCgpa())
            .applicationDeadline(drive.getApplicationDeadline())
            .driveDate(drive.getDriveDate())
            .location(drive.getLocation())
            .openings(drive.getOpenings())
            .requiredSkills(drive.getRequiredSkills())
            .status(drive.getStatus())
            .recruiterId(drive.getRecruiter() != null ? drive.getRecruiter().getId() : null)
            .recruiterCompany(drive.getRecruiter() != null ? drive.getRecruiter().getCompanyName() : null)
            .totalApplications(drive.getApplications() != null ? drive.getApplications().size() : 0)
            .createdAt(drive.getCreatedAt())
            .build();
    }
}
