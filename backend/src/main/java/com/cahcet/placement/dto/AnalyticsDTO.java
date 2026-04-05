package com.cahcet.placement.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

public class AnalyticsDTO {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DashboardStats {
        private long totalDrives;
        private long activeDrives;
        private long totalStudents;
        private long totalStudentsPlaced;
        private double placementPercentage;
        private long totalApplications;
        private long totalRecruiters;
        private Double avgCgpa;
        private Double avgCommunication;
        private Double avgTechnical;
        private Double avgProblemSolving;
        private String weakSkill;
        private List<CompanyStats> topCompanies;
        private List<DepartmentStats> departmentStats;
        private Map<String, Long> applicationsByStatus;
        private Map<String, Long> drivesByStatus;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CompanyStats {
        private String companyName;
        private Double rating;
        private Integer totalHires;
        private Double packageOffered;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DepartmentStats {
        private String department;
        private long totalStudents;
        private long placedStudents;
        private double placementRate;
    }
}
