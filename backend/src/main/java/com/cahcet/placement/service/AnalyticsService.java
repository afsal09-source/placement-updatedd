package com.cahcet.placement.service;

import com.cahcet.placement.dto.AnalyticsDTO.*;
import com.cahcet.placement.entity.Application;
import com.cahcet.placement.entity.PlacementDrive;
import com.cahcet.placement.entity.User;
import com.cahcet.placement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final PlacementDriveRepository driveRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final InterviewEvaluationRepository evaluationRepository;
    private final RecruiterProfileRepository recruiterRepository;

    public DashboardStats getDashboardStats() {
        long totalStudents = userRepository.countByRole(User.Role.STUDENT);
        long totalStudentsPlaced = studentProfileRepository.countByIsPlaced(true);
        long totalDrives = driveRepository.count();
        long activeDrives = driveRepository.countByStatus(PlacementDrive.DriveStatus.ACTIVE);
        long totalApplications = applicationRepository.count();
        long totalRecruiters = userRepository.countByRole(User.Role.RECRUITER);

        double placementPercentage = totalStudents > 0
            ? (double) totalStudentsPlaced / totalStudents * 100 : 0;

        Double avgCgpa = studentProfileRepository.findAverageCgpa();
        Double avgTechnical = evaluationRepository.findAvgTechnicalScore();
        Double avgCommunication = evaluationRepository.findAvgCommunicationScore();
        Double avgProblemSolving = evaluationRepository.findAvgProblemSolvingScore();

        String weakSkill = determineWeakSkill(avgTechnical, avgCommunication, avgProblemSolving,
            evaluationRepository.findAvgAptitudeScore());

        List<CompanyStats> topCompanies = getTopCompanies();
        List<DepartmentStats> departmentStats = getDepartmentStats();

        Map<String, Long> applicationsByStatus = new LinkedHashMap<>();
        for (Application.ApplicationStatus status : Application.ApplicationStatus.values()) {
            applicationsByStatus.put(status.name(), applicationRepository.countByStatus(status));
        }

        Map<String, Long> drivesByStatus = new LinkedHashMap<>();
        for (PlacementDrive.DriveStatus status : PlacementDrive.DriveStatus.values()) {
            drivesByStatus.put(status.name(), driveRepository.countByStatus(status));
        }

        return DashboardStats.builder()
            .totalDrives(totalDrives)
            .activeDrives(activeDrives)
            .totalStudents(totalStudents)
            .totalStudentsPlaced(totalStudentsPlaced)
            .placementPercentage(Math.round(placementPercentage * 100.0) / 100.0)
            .totalApplications(totalApplications)
            .totalRecruiters(totalRecruiters)
            .avgCgpa(avgCgpa != null ? Math.round(avgCgpa * 100.0) / 100.0 : 0)
            .avgCommunication(avgCommunication != null ? avgCommunication : 0)
            .avgTechnical(avgTechnical != null ? avgTechnical : 0)
            .avgProblemSolving(avgProblemSolving != null ? avgProblemSolving : 0)
            .weakSkill(weakSkill)
            .topCompanies(topCompanies)
            .departmentStats(departmentStats)
            .applicationsByStatus(applicationsByStatus)
            .drivesByStatus(drivesByStatus)
            .build();
    }

    private String determineWeakSkill(Double technical, Double communication,
                                       Double problemSolving, Double aptitude) {
        Map<String, Double> scores = new LinkedHashMap<>();
        if (technical != null) scores.put("Technical", technical);
        if (communication != null) scores.put("Communication", communication);
        if (problemSolving != null) scores.put("Problem Solving", problemSolving);
        if (aptitude != null) scores.put("Aptitude", aptitude);

        return scores.entrySet().stream()
            .filter(e -> e.getValue() < 3.0)
            .min(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("None");
    }

    private List<CompanyStats> getTopCompanies() {
        return recruiterRepository.findTopCompanies(PageRequest.of(0, 5)).stream()
            .map(r -> CompanyStats.builder()
                .companyName(r.getCompanyName())
                .rating(r.getAverageRating())
                .build())
            .collect(Collectors.toList());
    }

    private List<DepartmentStats> getDepartmentStats() {
        List<String> departments = List.of("CSE", "ECE", "EEE", "MECH", "CIVIL", "IT");
        List<DepartmentStats> stats = new ArrayList<>();
        for (String dept : departments) {
            long total = studentProfileRepository.findAll().stream()
                .filter(s -> dept.equals(s.getDepartment())).count();
            long placed = studentProfileRepository.findAll().stream()
                .filter(s -> dept.equals(s.getDepartment()) && s.isPlaced()).count();
            double rate = total > 0 ? (double) placed / total * 100 : 0;
            stats.add(DepartmentStats.builder()
                .department(dept)
                .totalStudents(total)
                .placedStudents(placed)
                .placementRate(Math.round(rate * 100.0) / 100.0)
                .build());
        }
        return stats.stream().filter(s -> s.getTotalStudents() > 0).collect(Collectors.toList());
    }
}
