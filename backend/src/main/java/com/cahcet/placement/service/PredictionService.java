package com.cahcet.placement.service;

import com.cahcet.placement.dto.StudentDTO.*;
import com.cahcet.placement.entity.StudentProfile;
import com.cahcet.placement.exception.ResourceNotFoundException;
import com.cahcet.placement.repository.*;
import com.cahcet.placement.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.OptionalDouble;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PredictionService {

    private final StudentProfileRepository studentProfileRepository;
    private final InterviewEvaluationRepository evaluationRepository;

    public PlacementPrediction predictForCurrentUser() {
        UserDetailsImpl currentUser = (UserDetailsImpl) SecurityContextHolder
            .getContext().getAuthentication().getPrincipal();
        StudentProfile student = studentProfileRepository.findByUserId(currentUser.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return predict(student);
    }

    public PlacementPrediction predictForStudent(Long studentId) {
        StudentProfile student = studentProfileRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));
        return predict(student);
    }

    private PlacementPrediction predict(StudentProfile student) {
        double cgpa = student.getCgpa() != null ? student.getCgpa() : 0.0;
        // Normalize CGPA to 0-5 scale (assuming max 10)
        double cgpaScore = Math.min(cgpa / 2.0, 5.0);

        // Get student's evaluation scores from their applications
        Double avgTechnical = getAvgTechnicalForStudent(student);
        Double avgCommunication = getAvgCommunicationForStudent(student);
        Double avgProblemSolving = getAvgProblemSolvingForStudent(student);

        // Default to 2.5 if no evaluations yet
        double technical = avgTechnical != null ? avgTechnical : 2.5;
        double communication = avgCommunication != null ? avgCommunication : 2.5;
        double problemSolving = avgProblemSolving != null ? avgProblemSolving : 2.5;

        // Formula: placementScore = (CGPA*0.3) + (technical*0.3) + (communication*0.2) + (problemSolving*0.2)
        // Normalize to 5-point scale
        double placementScore = (cgpaScore * 0.3) + (technical * 0.3)
            + (communication * 0.2) + (problemSolving * 0.2);

        double probability = Math.min((placementScore / 5.0) * 100, 100);
        probability = Math.round(probability * 100.0) / 100.0;

        String status;
        String message;
        if (probability >= 70) {
            status = "HIGH";
            message = "Excellent! You have a high probability of placement.";
        } else if (probability >= 45) {
            status = "MEDIUM";
            message = "Good potential. Focus on improving weak areas.";
        } else {
            status = "LOW";
            message = "Need significant improvement. Work on all skill areas.";
        }

        List<String> suggestions = generateSuggestions(cgpaScore, technical, communication, problemSolving);

        return PlacementPrediction.builder()
            .placementScore(Math.round(placementScore * 100.0) / 100.0)
            .probabilityPercent(probability)
            .status(status)
            .message(message)
            .suggestions(suggestions)
            .build();
    }

    private Double getAvgTechnicalForStudent(StudentProfile student) {
        return student.getApplications().stream()
            .filter(a -> a.getEvaluation() != null && a.getEvaluation().getTechnicalScore() != null)
            .mapToInt(a -> a.getEvaluation().getTechnicalScore())
            .average()
            .stream().boxed().findFirst().orElse(null);
    }

    private Double getAvgCommunicationForStudent(StudentProfile student) {
        return student.getApplications().stream()
            .filter(a -> a.getEvaluation() != null && a.getEvaluation().getCommunicationScore() != null)
            .mapToInt(a -> a.getEvaluation().getCommunicationScore())
            .average()
            .stream().boxed().findFirst().orElse(null);
    }

    private Double getAvgProblemSolvingForStudent(StudentProfile student) {
        return student.getApplications().stream()
            .filter(a -> a.getEvaluation() != null && a.getEvaluation().getProblemSolvingScore() != null)
            .mapToInt(a -> a.getEvaluation().getProblemSolvingScore())
            .average()
            .stream().boxed().findFirst().orElse(null);
    }

    private List<String> generateSuggestions(double cgpa, double technical,
                                               double communication, double problemSolving) {
        List<String> suggestions = new ArrayList<>();
        if (cgpa < 3.0) suggestions.add("Improve your CGPA — aim for at least 7.5/10");
        if (technical < 3.0) suggestions.add("Strengthen technical skills: DSA, OS, DBMS, CN");
        if (communication < 3.0) suggestions.add("Improve communication: attend GD/HR sessions");
        if (problemSolving < 3.0) suggestions.add("Practice problem solving on LeetCode/HackerRank");
        if (suggestions.isEmpty()) suggestions.add("Keep up the great work! Apply to top companies.");
        return suggestions;
    }

    public SkillGapAnalysis getSkillGapAnalysis(Long studentId) {
        StudentProfile student = studentProfileRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));

        Double avgTechnical = getAvgTechnicalForStudent(student);
        Double avgComm = getAvgCommunicationForStudent(student);
        Double avgPS = getAvgProblemSolvingForStudent(student);

        List<String> weakSkills = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        if (avgTechnical != null && avgTechnical < 3.0) {
            weakSkills.add("Technical");
            suggestions.add("Practice coding challenges daily");
        }
        if (avgComm != null && avgComm < 3.0) {
            weakSkills.add("Communication");
            suggestions.add("Join spoken English and presentation workshops");
        }
        if (avgPS != null && avgPS < 3.0) {
            weakSkills.add("Problem Solving");
            suggestions.add("Solve 2 algorithmic problems daily");
        }

        return SkillGapAnalysis.builder()
            .avgTechnical(avgTechnical)
            .avgCommunication(avgComm)
            .avgProblemSolving(avgPS)
            .weakSkills(weakSkills)
            .suggestions(suggestions)
            .build();
    }
}
