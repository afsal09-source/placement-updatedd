package com.cahcet.placement.service;

import com.cahcet.placement.dto.StudentDTO.*;
import com.cahcet.placement.entity.StudentProfile;
import com.cahcet.placement.exception.ResourceNotFoundException;
import com.cahcet.placement.repository.StudentProfileRepository;
import com.cahcet.placement.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentService {

    private final StudentProfileRepository studentProfileRepository;

    private static final String UPLOAD_DIR = "./uploads/resumes/";

    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile() {
        UserDetailsImpl current = (UserDetailsImpl) SecurityContextHolder
            .getContext().getAuthentication().getPrincipal();
        StudentProfile profile = studentProfileRepository.findByUserId(current.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return mapToResponse(profile);
    }

    @Transactional(readOnly = true)
    public ProfileResponse getStudentProfile(Long studentId) {
        StudentProfile profile = studentProfileRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));
        return mapToResponse(profile);
    }

    @Transactional(readOnly = true)
    public List<ProfileResponse> getAllStudents() {
        return studentProfileRepository.findAll().stream()
            .map(this::mapToResponse).collect(Collectors.toList());
    }

    public ProfileResponse updateProfile(ProfileUpdateRequest request) {
        UserDetailsImpl current = (UserDetailsImpl) SecurityContextHolder
            .getContext().getAuthentication().getPrincipal();
        StudentProfile profile = studentProfileRepository.findByUserId(current.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        if (request.getCgpa() != null) profile.setCgpa(request.getCgpa());
        if (request.getPhoneNumber() != null) profile.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) profile.setAddress(request.getAddress());
        if (request.getLinkedin() != null) profile.setLinkedin(request.getLinkedin());
        if (request.getGithub() != null) profile.setGithub(request.getGithub());
        if (request.getSkills() != null) profile.setSkills(request.getSkills());
        if (request.getDepartment() != null) profile.setDepartment(request.getDepartment());
        if (request.getBatch() != null) profile.setBatch(request.getBatch());

        return mapToResponse(studentProfileRepository.save(profile));
    }

    public String uploadResume(MultipartFile file) throws IOException {
        UserDetailsImpl current = (UserDetailsImpl) SecurityContextHolder
            .getContext().getAuthentication().getPrincipal();
        StudentProfile profile = studentProfileRepository.findByUserId(current.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        if (!file.getContentType().equals("application/pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }

        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        profile.setResumePath(filePath.toString());
        profile.setResumeOriginalName(file.getOriginalFilename());
        studentProfileRepository.save(profile);

        return filename;
    }

    private ProfileResponse mapToResponse(StudentProfile p) {
        return ProfileResponse.builder()
            .id(p.getId())
            .userId(p.getUser().getId())
            .email(p.getUser().getEmail())
            .firstName(p.getUser().getFirstName())
            .lastName(p.getUser().getLastName())
            .rollNumber(p.getRollNumber())
            .department(p.getDepartment())
            .batch(p.getBatch())
            .cgpa(p.getCgpa())
            .phoneNumber(p.getPhoneNumber())
            .address(p.getAddress())
            .linkedin(p.getLinkedin())
            .github(p.getGithub())
            .skills(p.getSkills())
            .resumeOriginalName(p.getResumeOriginalName())
            .isPlaced(p.isPlaced())
            .placedCompany(p.getPlacedCompany())
            .placedPackage(p.getPlacedPackage())
            .createdAt(p.getCreatedAt())
            .build();
    }
}
