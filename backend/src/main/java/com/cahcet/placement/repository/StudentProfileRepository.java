package com.cahcet.placement.repository;

import com.cahcet.placement.entity.StudentProfile;
import com.cahcet.placement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUser(User user);
    Optional<StudentProfile> findByUserId(Long userId);
    Optional<StudentProfile> findByRollNumber(String rollNumber);
    boolean existsByRollNumber(String rollNumber);
    List<StudentProfile> findByIsPlaced(boolean isPlaced);
    long countByIsPlaced(boolean isPlaced);
    
    @Query("SELECT AVG(s.cgpa) FROM StudentProfile s")
    Double findAverageCgpa();
    
    @Query("SELECT s FROM StudentProfile s WHERE s.cgpa >= :minCgpa AND s.department IN :departments")
    List<StudentProfile> findEligibleStudents(Double minCgpa, List<String> departments);
}
