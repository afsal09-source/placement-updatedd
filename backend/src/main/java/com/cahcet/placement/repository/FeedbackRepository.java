package com.cahcet.placement.repository;

import com.cahcet.placement.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByDriveId(Long driveId);
    List<Feedback> findBySubmittedById(Long userId);
    List<Feedback> findByIsApproved(boolean isApproved);
    
    @Query("SELECT AVG(f.companyRating) FROM Feedback f WHERE f.drive.recruiter.id = :recruiterId")
    Double findAvgCompanyRatingByRecruiter(Long recruiterId);
    
    @Query("SELECT AVG(f.overallRating) FROM Feedback f")
    Double findOverallAvgRating();
}
