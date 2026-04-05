package com.cahcet.placement.dto;

import com.cahcet.placement.entity.User;
import jakarta.validation.constraints.*;
import lombok.*;

public class AuthDTO {

    @Data
    public static class SendOtpRequest {
        @NotBlank @Email
        private String email;
    }

    @Data
    public static class VerifyOtpRequest {
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 6, max = 6, message = "OTP must be 6 digits")
        private String otp;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank @Email
        private String email;

        @NotBlank @Size(min = 6, max = 40)
        private String password;

        @NotBlank
        private String firstName;

        @NotBlank
        private String lastName;

        @NotNull
        private User.Role role;

        // Student specific
        private String rollNumber;
        private String department;
        private String batch;

        // Recruiter specific
        private String companyName;
        private String designation;
    }

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;

        @NotBlank
        private String password;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String tokenType = "Bearer";
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String role;
        private String message;
    }
}
