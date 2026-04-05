package com.cahcet.placement.repository;

import com.cahcet.placement.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewEvaluationRepository extends JpaRepository<InterviewEvaluation, Long> {
    Optional<InterviewEvaluation> findByApplicationId(Long applicationId);
    
    @Query("SELECT AVG(e.technicalScore) FROM InterviewEvaluation e")
    Double findAvgTechnicalScore();
    
    @Query("SELECT AVG(e.communicationScore) FROM InterviewEvaluation e")
    Double findAvgCommunicationScore();
    
    @Query("SELECT AVG(e.problemSolvingScore) FROM InterviewEvaluation e")
    Double findAvgProblemSolvingScore();
    
    @Query("SELECT AVG(e.aptitudeScore) FROM InterviewEvaluation e")
    Double findAvgAptitudeScore();
    
    @Query("SELECT AVG(e.hrScore) FROM InterviewEvaluation e")
    Double findAvgHrScore();
}
