package com.cahcet.placement.repository;

import com.cahcet.placement.entity.PlacementDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlacementDriveRepository extends JpaRepository<PlacementDrive, Long> {
    List<PlacementDrive> findByStatus(PlacementDrive.DriveStatus status);
    List<PlacementDrive> findByRecruiterId(Long recruiterId);
    long countByStatus(PlacementDrive.DriveStatus status);
    
    @Query("SELECT d FROM PlacementDrive d ORDER BY d.createdAt DESC")
    List<PlacementDrive> findRecentDrives(org.springframework.data.domain.Pageable pageable);
    
    @Query("SELECT d FROM PlacementDrive d WHERE d.status = 'ACTIVE' AND " +
           "(d.eligibleDepartments LIKE %:dept% OR d.eligibleDepartments = 'ALL') " +
           "AND d.minimumCgpa <= :cgpa")
    List<PlacementDrive> findEligibleDrives(String dept, Double cgpa);
}
