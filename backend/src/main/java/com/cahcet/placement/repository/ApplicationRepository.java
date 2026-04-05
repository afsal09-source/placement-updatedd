package com.cahcet.placement.repository;

import com.cahcet.placement.entity.Application;
import com.cahcet.placement.entity.PlacementDrive;
import com.cahcet.placement.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudent(StudentProfile student);
    List<Application> findByDrive(PlacementDrive drive);
    Optional<Application> findByStudentAndDrive(StudentProfile student, PlacementDrive drive);
    boolean existsByStudentAndDrive(StudentProfile student, PlacementDrive drive);
    List<Application> findByStatus(Application.ApplicationStatus status);
    long countByStatus(Application.ApplicationStatus status);
    
    @Query("SELECT COUNT(DISTINCT a.student.id) FROM Application a WHERE a.status = 'SELECTED'")
    long countDistinctPlacedStudents();
    
    List<Application> findByStudentId(Long studentId);
    List<Application> findByDriveId(Long driveId);
}
