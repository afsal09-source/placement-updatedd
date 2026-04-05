package com.cahcet.placement.service;

import com.cahcet.placement.entity.OtpVerification;
import com.cahcet.placement.exception.BadRequestException;
import com.cahcet.placement.repository.OtpVerificationRepository;
import com.cahcet.placement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OtpService {

    private final OtpVerificationRepository otpRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.otp.expiry-minutes:10}")
    private int otpExpiryMinutes;

    private static final int MAX_ATTEMPTS = 5;
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Step 1: Send OTP to email for verification before registration.
     */
    public void sendOtp(String email) {
        // Check if already registered
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("This email is already registered. Please login.");
        }

        // Delete any existing OTP for this email
        otpRepository.deleteByEmail(email);

        // Generate 6-digit OTP
        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));

        OtpVerification verification = OtpVerification.builder()
            .email(email)
            .otp(otp)
            .expiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
            .verified(false)
            .attempts(0)
            .build();

        otpRepository.save(verification);

        // Send OTP email (async). Do not fail OTP flow if email service throws.
        try {
            emailService.sendOtpEmail(email, otp, otpExpiryMinutes);
            log.info("OTP process complete for email: {} (OTP delivered or logged)", email);
        } catch (Exception e) {
            log.warn("OTP was generated and stored, but email delivery failed for {}: {}", email, e.getMessage());
            // Keep the OTP in DB; user can still verify manually from logs in dev mode.
        }
    }

    /**
     * Step 2: Verify the OTP entered by the user.
     */
    public void verifyOtp(String email, String otp) {
        OtpVerification record = otpRepository.findByEmail(email)
            .orElseThrow(() -> new BadRequestException(
                "No OTP found for this email. Please request a new OTP."));

        if (record.isVerified()) {
            throw new BadRequestException("Email is already verified. Please complete registration.");
        }

        if (LocalDateTime.now().isAfter(record.getExpiresAt())) {
            otpRepository.delete(record);
            throw new BadRequestException(
                "OTP has expired. Please request a new OTP.");
        }

        if (record.getAttempts() >= MAX_ATTEMPTS) {
            otpRepository.delete(record);
            throw new BadRequestException(
                "Too many incorrect attempts. Please request a new OTP.");
        }

        if (!record.getOtp().equals(otp.trim())) {
            record.setAttempts(record.getAttempts() + 1);
            otpRepository.save(record);
            int remaining = MAX_ATTEMPTS - record.getAttempts();
            throw new BadRequestException(
                "Invalid OTP. " + remaining + " attempt(s) remaining.");
        }

        // Mark as verified
        record.setVerified(true);
        otpRepository.save(record);
        log.info("OTP verified successfully for email: {}", email);
    }

    /**
     * Check if an email has a valid (verified) OTP before allowing registration.
     */
    @Transactional(readOnly = true)
    public boolean isEmailVerified(String email) {
        return otpRepository.findByEmail(email)
            .map(OtpVerification::isVerified)
            .orElse(false);
    }

    /**
     * Cleanup after registration completes.
     */
    public void cleanupAfterRegistration(String email) {
        otpRepository.deleteByEmail(email);
    }
}
