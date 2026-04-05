package com.cahcet.placement.service;

import com.cahcet.placement.dto.AuthDTO.*;
import com.cahcet.placement.entity.*;
import com.cahcet.placement.exception.BadRequestException;
import com.cahcet.placement.repository.*;
import com.cahcet.placement.security.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final OtpService otpService;

    public AuthResponse register(RegisterRequest request) {
        // ── OTP gate ──────────────────────────────────────────────────────
        if (!otpService.isEmailVerified(request.getEmail())) {
            throw new BadRequestException(
                "Email not verified. Please verify your email with OTP before registering.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .role(request.getRole())
            .active(true)
            .build();

        user = userRepository.save(user);

        if (request.getRole() == User.Role.STUDENT) {
            if (request.getRollNumber() == null || request.getRollNumber().isBlank()) {
                throw new BadRequestException("Roll number is required for students");
            }
            if (studentProfileRepository.existsByRollNumber(request.getRollNumber())) {
                throw new BadRequestException("Roll number already exists");
            }
            StudentProfile profile = StudentProfile.builder()
                .user(user)
                .rollNumber(request.getRollNumber())
                .department(request.getDepartment())
                .batch(request.getBatch())
                .build();
            studentProfileRepository.save(profile);
        } else if (request.getRole() == User.Role.RECRUITER) {
            if (request.getCompanyName() == null || request.getCompanyName().isBlank()) {
                throw new BadRequestException("Company name is required for recruiters");
            }
            RecruiterProfile profile = RecruiterProfile.builder()
                .user(user)
                .companyName(request.getCompanyName())
                .designation(request.getDesignation())
                .build();
            recruiterProfileRepository.save(profile);
        }

        String token = jwtTokenProvider.generateTokenFromEmail(user.getEmail(), user.getRole().name());

        // Send registration confirmation email (async, non-blocking)
        emailService.sendRegistrationConfirmation(
            user.getEmail(), user.getFirstName(), user.getLastName(), user.getRole().name()
        );

        // Cleanup OTP record after successful registration
        otpService.cleanupAfterRegistration(user.getEmail());

        return AuthResponse.builder()
            .token(token)
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .role(user.getRole().name())
            .message("Registration successful")
            .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BadRequestException("User not found"));

        return AuthResponse.builder()
            .token(token)
            .id(userDetails.getId())
            .email(userDetails.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .role(userDetails.getRole())
            .message("Login successful")
            .build();
    }
}



