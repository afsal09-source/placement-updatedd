package com.cahcet.placement.service;

import com.cahcet.placement.dto.ApplicationDTO.*;
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
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PlacementDriveRepository driveRepository;
    private final InterviewEvaluationRepository evaluationRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public ApplicationResponse applyForDrive(ApplyRequest request) {
        UserDetailsImpl currentUser = (UserDetailsImpl) SecurityContextHolder
            .getContext().getAuthentication().getPrincipal();

        StudentProfile student = studentProfileRepository.findByUserId(currentUser.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        PlacementDrive drive = driveRepository.findById(request.getDriveId())
            .orElseThrow(() -> new ResourceNotFoundException("Drive", request.getDriveId()));

        if (applicationRepository.existsByStudentAndDrive(student, drive)) {
            throw new BadRequestException("You have already applied for this drive");
        }

        if (drive.getStatus() != PlacementDrive.DriveStatus.ACTIVE) {
            throw new BadRequestException("This drive is not accepting applications");
        }

        Application application = Application.builder()
            .student(student)
            .drive(drive)
            .status(Application.ApplicationStatus.APPLIED)
            .coverLetter(request.getCoverLetter())
            .resumeSnapshot(student.getResumePath())
            .build();

        application = applicationRepository.save(application);

        // Send application confirmation email (async)
        emailService.sendApplicationConfirmation(
            student.getUser().getEmail(),
            student.getUser().getFirstName(),
            drive.getCompanyName(),
            drive.getJobRole(),
            drive.getDriveDate() != null ? drive.getDriveDate().toString() : null,
            drive.getApplicationDeadline() != null ? drive.getApplicationDeadline().toString() : null
        );

        return mapToResponse(application);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getMyApplications() {
        UserDetailsImpl currentUser = (UserDetailsImpl) SecurityContextHolder
            .getContext().getAuthentication().getPrincipal();
        return applicationRepository.findByStudentId(currentUser.getId()).stream()
            .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsForDrive(Long driveId) {
        return applicationRepository.findByDriveId(driveId).stream()
            .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getAllApplications() {
        return applicationRepository.findAll().stream()
            .map(this::mapToResponse).collect(Collectors.toList());
    }

    public ApplicationResponse updateStatus(Long applicationId, StatusUpdateRequest request) {
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Application", applicationId));

        application.setStatus(request.getStatus());
        application = applicationRepository.save(application);

        // Notify student (in-app)
        String msg = "Your application for " + application.getDrive().getCompanyName() +
            " has been updated to: " + request.getStatus();
        notificationService.notifyUser(
            application.getStudent().getUser(),
            "Application Status Update",
            msg,
            Notification.NotificationType.APPLICATION_STATUS
        );

        // Send status update email (async)
        emailService.sendStatusUpdateEmail(
            application.getStudent().getUser().getEmail(),
            application.getStudent().getUser().getFirstName(),
            application.getDrive().getCompanyName(),
            request.getStatus().name()
        );

        // If selected, mark student as placed
        if (request.getStatus() == Application.ApplicationStatus.SELECTED) {
            StudentProfile student = application.getStudent();
            student.setPlaced(true);
            student.setPlacedCompany(application.getDrive().getCompanyName());
            student.setPlacedPackage(application.getDrive().getPackageOffered());
            studentProfileRepository.save(student);
        }

        return mapToResponse(application);
    }

    public void addEvaluation(Long applicationId, EvaluationRequest request) {
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Application", applicationId));

        UserDetailsImpl currentUser = (UserDetailsImpl) SecurityContextHolder
            .getContext().getAuthentication().getPrincipal();

        double overall = (request.getTechnicalScore() + request.getCommunicationScore()
            + request.getProblemSolvingScore() + request.getAptitudeScore()
            + request.getHrScore()) / 5.0;

        InterviewEvaluation evaluation = InterviewEvaluation.builder()
            .application(application)
            .technicalScore(request.getTechnicalScore())
            .communicationScore(request.getCommunicationScore())
            .problemSolvingScore(request.getProblemSolvingScore())
            .aptitudeScore(request.getAptitudeScore())
            .hrScore(request.getHrScore())
            .evaluatorComments(request.getEvaluatorComments())
            .evaluatedBy(currentUser.getEmail())
            .overallScore(overall)
            .recommendation(request.getRecommendation())
            .build();

        evaluationRepository.save(evaluation);
    }

    private ApplicationResponse mapToResponse(Application app) {
        return ApplicationResponse.builder()
            .id(app.getId())
            .driveId(app.getDrive().getId())
            .driveTitle(app.getDrive().getTitle())
            .companyName(app.getDrive().getCompanyName())
            .studentId(app.getStudent().getId())
            .studentName(app.getStudent().getUser().getFullName())
            .rollNumber(app.getStudent().getRollNumber())
            .department(app.getStudent().getDepartment())
            .cgpa(app.getStudent().getCgpa())
            .status(app.getStatus())
            .coverLetter(app.getCoverLetter())
            .resumeSnapshot(app.getResumeSnapshot())
            .resumeOriginalName(app.getStudent().getResumeOriginalName())
            .appliedAt(app.getAppliedAt())
            .updatedAt(app.getUpdatedAt())
            .build();
    }
}
