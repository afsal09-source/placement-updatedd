package com.cahcet.placement.service;

import com.cahcet.placement.dto.FeedbackDTO.*;
import com.cahcet.placement.entity.*;
import com.cahcet.placement.exception.ResourceNotFoundException;
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
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final PlacementDriveRepository driveRepository;
    private final RecruiterProfileRepository recruiterRepository;

    public FeedbackResponse submitFeedback(SubmitRequest request) {
        UserDetailsImpl current = (UserDetailsImpl) SecurityContextHolder
            .getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(current.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User", current.getId()));

        Feedback feedback = Feedback.builder()
            .submittedBy(user)
            .type(request.getType())
            .overallRating(request.getOverallRating())
            .interviewProcessRating(request.getInterviewProcessRating())
            .companyRating(request.getCompanyRating())
            .placementCellRating(request.getPlacementCellRating())
            .comments(request.getComments())
            .suggestions(request.getSuggestions())
            .isAnonymous(request.isAnonymous())
            .isApproved(false)
            .build();

        if (request.getDriveId() != null) {
            PlacementDrive drive = driveRepository.findById(request.getDriveId())
                .orElseThrow(() -> new ResourceNotFoundException("Drive", request.getDriveId()));
            feedback.setDrive(drive);
        }

        feedback = feedbackRepository.save(feedback);

        // Update company rating
        if (feedback.getDrive() != null && feedback.getDrive().getRecruiter() != null) {
            updateCompanyRating(feedback.getDrive().getRecruiter());
        }

        return mapToResponse(feedback);
    }

    private void updateCompanyRating(RecruiterProfile recruiter) {
        Double avg = feedbackRepository.findAvgCompanyRatingByRecruiter(recruiter.getId());
        if (avg != null) {
            recruiter.setAverageRating(Math.round(avg * 10.0) / 10.0);
            recruiter.setTotalRatings(recruiter.getTotalRatings() != null ? recruiter.getTotalRatings() + 1 : 1);
            recruiterRepository.save(recruiter);
        }
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getAllFeedback() {
        return feedbackRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getApprovedFeedback() {
        return feedbackRepository.findByIsApproved(true).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public FeedbackResponse approveFeedback(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Feedback", id));
        feedback.setApproved(true);
        return mapToResponse(feedbackRepository.save(feedback));
    }

    private FeedbackResponse mapToResponse(Feedback f) {
        return FeedbackResponse.builder()
            .id(f.getId())
            .submittedBy(f.isAnonymous() ? "Anonymous" : f.getSubmittedBy().getFullName())
            .driveTitle(f.getDrive() != null ? f.getDrive().getTitle() : null)
            .companyName(f.getDrive() != null ? f.getDrive().getCompanyName() : null)
            .type(f.getType())
            .overallRating(f.getOverallRating())
            .interviewProcessRating(f.getInterviewProcessRating())
            .companyRating(f.getCompanyRating())
            .placementCellRating(f.getPlacementCellRating())
            .comments(f.getComments())
            .suggestions(f.getSuggestions())
            .isAnonymous(f.isAnonymous())
            .isApproved(f.isApproved())
            .createdAt(f.getCreatedAt())
            .build();
    }
}
