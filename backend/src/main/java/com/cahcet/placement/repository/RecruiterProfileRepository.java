package com.cahcet.placement.repository;

import com.cahcet.placement.entity.RecruiterProfile;
import com.cahcet.placement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecruiterProfileRepository extends JpaRepository<RecruiterProfile, Long> {
    Optional<RecruiterProfile> findByUser(User user);
    Optional<RecruiterProfile> findByUserId(Long userId);
    
    @Query("SELECT r FROM RecruiterProfile r ORDER BY r.averageRating DESC")
    List<RecruiterProfile> findTopRatedCompanies();
    
    @Query("SELECT r FROM RecruiterProfile r WHERE r.averageRating IS NOT NULL ORDER BY r.averageRating DESC")
    List<RecruiterProfile> findTopCompanies(org.springframework.data.domain.Pageable pageable);
}
