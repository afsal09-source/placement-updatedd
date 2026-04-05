package com.cahcet.placement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String fromAddress;

    @Value("${app.email.college-name}")
    private String collegeName;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // ── Brand colours used in all emails ──────────────────────────────────
    private static final String NAVY   = "#0A2463";
    private static final String GOLD   = "#F4A700";
    private static final String BLUE   = "#1E6FCF";
    private static final String GREEN  = "#10B981";
    private static final String RED    = "#EF4444";

    // ─────────────────────────────────────────────────────────────────────
    // REGISTRATION CONFIRMATION
    // ─────────────────────────────────────────────────────────────────────
    @Async
    public void sendRegistrationConfirmation(String toEmail, String firstName,
                                              String lastName, String role) {
        try {
            String subject = "Welcome to CAHCET Placement Portal – Registration Confirmed";
            String html = buildRegistrationEmail(firstName, lastName, role, toEmail);
            sendHtml(toEmail, subject, html);
            log.info("Registration email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send registration email to {}: {}", toEmail, e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // DRIVE APPLICATION CONFIRMATION
    // ─────────────────────────────────────────────────────────────────────
    @Async
    public void sendApplicationConfirmation(String toEmail, String firstName,
                                             String companyName, String jobRole,
                                             String driveDate, String deadline) {
        try {
            String subject = "Application Submitted – " + companyName + " | CAHCET Placement Portal";
            String html = buildApplicationEmail(firstName, companyName, jobRole, driveDate, deadline);
            sendHtml(toEmail, subject, html);
            log.info("Application confirmation email sent to {} for drive {}", toEmail, companyName);
        } catch (Exception e) {
            log.error("Failed to send application email to {}: {}", toEmail, e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // APPLICATION STATUS UPDATE
    // ─────────────────────────────────────────────────────────────────────
    @Async
    public void sendStatusUpdateEmail(String toEmail, String firstName,
                                       String companyName, String newStatus) {
        try {
            String subject = "Application Update – " + companyName + " | CAHCET Placement Portal";
            String html = buildStatusEmail(firstName, companyName, newStatus);
            sendHtml(toEmail, subject, html);
            log.info("Status update email sent to {} — status: {}", toEmail, newStatus);
        } catch (Exception e) {
            log.error("Failed to send status email to {}: {}", toEmail, e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // NEW DRIVE NOTIFICATION
    // ─────────────────────────────────────────────────────────────────────
    @Async
    public void sendNewDriveNotification(String toEmail, String firstName,
                                          String companyName, String jobRole,
                                          String packageOffered, String deadline,
                                          String driveDate) {
        try {
            String subject = "New Placement Drive: " + companyName + " | CAHCET Placement Portal";
            String html = buildNewDriveEmail(firstName, companyName, jobRole,
                    packageOffered, deadline, driveDate);
            sendHtml(toEmail, subject, html);
            log.info("New drive email sent to {} for {}", toEmail, companyName);
        } catch (Exception e) {
            log.error("Failed to send drive notification to {}: {}", toEmail, e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // PRIVATE: send helper
    // ─────────────────────────────────────────────────────────────────────
    private void sendHtml(String to, String subject, String html) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromAddress);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(message);
    }

    // ─────────────────────────────────────────────────────────────────────
    // EMAIL TEMPLATES
    // ─────────────────────────────────────────────────────────────────────

    private String emailWrapper(String contentHtml) {
        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CAHCET Placement Portal</title>
        </head>
        <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;">
          <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

                <!-- Header -->
                <tr>
                  <td style="background:%s;padding:28px 36px 20px;">
                    <table width="100%%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <div style="font-size:20px;font-weight:bold;color:#ffffff;letter-spacing:0.5px;">
                            🎓 CAHCET
                          </div>
                          <div style="font-size:11px;color:%s;margin-top:4px;">
                            Smart Placement Analytics & Feedback Management System
                          </div>
                        </td>
                        <td align="right">
                          <div style="background:%s;color:%s;font-size:10px;font-weight:bold;
                                      padding:6px 12px;border-radius:20px;letter-spacing:1px;">
                            PLACEMENT PORTAL
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Gold strip -->
                <tr><td style="height:4px;background:%s;"></td></tr>

                <!-- Content -->
                <tr><td style="padding:36px 36px 28px;">
                  %s
                </td></tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 36px;">
                    <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;">
                      This is an automated message from the CAHCET Placement Portal.<br>
                      <strong style="color:#64748b;">%s</strong><br>
                      Department of Computer Science &amp; Engineering, Melvisharam.
                    </p>
                    <p style="margin:8px 0 0;font-size:11px;color:#94a3b8;">
                      If you did not expect this email, please contact the placement cell.
                    </p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """.formatted(NAVY, "#a0b4cc", "#ffffff22", "#ffffff",
                      GOLD, contentHtml, collegeName);
    }

    // ── Registration ──────────────────────────────────────────────────────
    private String buildRegistrationEmail(String firstName, String lastName,
                                           String role, String email) {
        String roleLabel = switch (role) {
            case "STUDENT"     -> "Student";
            case "RECRUITER"   -> "Recruiter";
            case "ADMIN"       -> "Placement Officer (Admin)";
            case "COORDINATOR" -> "Coordinator";
            default            -> role;
        };
        String roleColor = switch (role) {
            case "STUDENT"   -> BLUE;
            case "RECRUITER" -> "#8B5CF6";
            case "ADMIN"     -> NAVY;
            default          -> "#0D9488";
        };
        String dashboardPath = switch (role) {
            case "STUDENT"     -> "/student";
            case "RECRUITER"   -> "/recruiter";
            case "ADMIN"       -> "/admin";
            case "COORDINATOR" -> "/coordinator";
            default            -> "/";
        };

        String content = """
        <h2 style="margin:0 0 8px;font-size:24px;color:#1a1a2e;font-weight:bold;">
          Welcome, %s! 🎉
        </h2>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;">
          Your registration on the CAHCET Placement Portal is confirmed.
        </p>

        <!-- Role Badge -->
        <div style="background:%s15;border:1.5px solid %s40;border-radius:8px;
                    padding:16px 20px;margin-bottom:24px;">
          <span style="font-size:12px;font-weight:bold;color:%s;text-transform:uppercase;
                       letter-spacing:1px;">Your Role</span>
          <div style="font-size:18px;font-weight:bold;color:#1a1a2e;margin-top:4px;">%s</div>
        </div>

        <!-- Details -->
        <table width="100%%" cellpadding="0" cellspacing="0"
               style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:28px;">
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;font-size:12px;font-weight:bold;color:#64748b;
                       width:130px;border-bottom:1px solid #e2e8f0;">Full Name</td>
            <td style="padding:12px 16px;font-size:13px;color:#1a1a2e;
                       border-bottom:1px solid #e2e8f0;">%s %s</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:12px;font-weight:bold;color:#64748b;
                       width:130px;border-bottom:1px solid #e2e8f0;">Email</td>
            <td style="padding:12px 16px;font-size:13px;color:#1a1a2e;
                       border-bottom:1px solid #e2e8f0;">%s</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;font-size:12px;font-weight:bold;color:#64748b;">Status</td>
            <td style="padding:12px 16px;">
              <span style="background:#dcfce7;color:#166534;font-size:11px;font-weight:bold;
                           padding:3px 10px;border-radius:20px;">✓ Active</span>
            </td>
          </tr>
        </table>

        <!-- CTA -->
        <div style="text-align:center;margin-bottom:24px;">
          <a href="%s%s" style="display:inline-block;background:%s;color:#ffffff;
             font-size:14px;font-weight:bold;text-decoration:none;
             padding:13px 36px;border-radius:8px;letter-spacing:0.3px;">
            Go to My Dashboard →
          </a>
        </div>

        <p style="margin:0;font-size:13px;color:#64748b;line-height:1.7;">
          You can now log in using your registered email and password.<br>
          If you face any issues, please contact the CAHCET Placement Cell.
        </p>
        """.formatted(
            firstName,
            roleColor, roleColor, roleColor, roleLabel,
            firstName, lastName, email,
            frontendUrl, dashboardPath, NAVY
        );

        return emailWrapper(content);
    }

    // ── Drive Application ─────────────────────────────────────────────────
    private String buildApplicationEmail(String firstName, String companyName,
                                          String jobRole, String driveDate,
                                          String deadline) {
        String content = """
        <h2 style="margin:0 0 8px;font-size:22px;color:#1a1a2e;font-weight:bold;">
          Application Submitted ✅
        </h2>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;">
          Hi %s, your application has been successfully submitted!
        </p>

        <!-- Company Card -->
        <div style="background:%s;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
          <div style="font-size:11px;font-weight:bold;color:#a0b4cc;letter-spacing:1px;
                      text-transform:uppercase;">Company</div>
          <div style="font-size:22px;font-weight:bold;color:#ffffff;margin:4px 0 2px;">%s</div>
          <div style="font-size:13px;color:#7eb3d9;">%s</div>
        </div>

        <!-- Drive Details -->
        <table width="100%%" cellpadding="0" cellspacing="0"
               style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:28px;">
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;font-size:12px;font-weight:bold;color:#64748b;
                       width:140px;border-bottom:1px solid #e2e8f0;">Drive Date</td>
            <td style="padding:12px 16px;font-size:13px;color:#1a1a2e;
                       border-bottom:1px solid #e2e8f0;">%s</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:12px;font-weight:bold;color:#64748b;
                       width:140px;border-bottom:1px solid #e2e8f0;">Deadline</td>
            <td style="padding:12px 16px;font-size:13px;color:#dc2626;font-weight:bold;
                       border-bottom:1px solid #e2e8f0;">%s</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;font-size:12px;font-weight:bold;color:#64748b;">Status</td>
            <td style="padding:12px 16px;">
              <span style="background:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:bold;
                           padding:3px 10px;border-radius:20px;">Applied</span>
            </td>
          </tr>
        </table>

        <!-- Info box -->
        <div style="background:#fffbeb;border:1.5px solid #fcd34d;border-radius:8px;
                    padding:14px 18px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
            <strong>📌 What's next?</strong><br>
            The placement team will review your application and update your status.
            You will receive another email when your status changes.
            Keep checking your dashboard for updates.
          </p>
        </div>

        <!-- CTA -->
        <div style="text-align:center;">
          <a href="%s/student/applications" style="display:inline-block;background:%s;
             color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;
             padding:13px 36px;border-radius:8px;">
            View My Applications →
          </a>
        </div>
        """.formatted(
            firstName, NAVY, companyName, jobRole != null ? jobRole : "Position TBD",
            driveDate != null ? driveDate : "TBD",
            deadline  != null ? deadline  : "TBD",
            frontendUrl, BLUE
        );

        return emailWrapper(content);
    }

    // ── Status Update ─────────────────────────────────────────────────────
    private String buildStatusEmail(String firstName, String companyName, String status) {
        String statusColor = switch (status) {
            case "SHORTLISTED" -> "#d97706";
            case "INTERVIEWED" -> "#7c3aed";
            case "SELECTED"    -> GREEN;
            case "REJECTED"    -> RED;
            default            -> BLUE;
        };
        String statusBg = switch (status) {
            case "SHORTLISTED" -> "#fef3c7";
            case "INTERVIEWED" -> "#ede9fe";
            case "SELECTED"    -> "#dcfce7";
            case "REJECTED"    -> "#fee2e2";
            default            -> "#dbeafe";
        };
        String statusIcon = switch (status) {
            case "SHORTLISTED" -> "🔔";
            case "INTERVIEWED" -> "💬";
            case "SELECTED"    -> "🎉";
            case "REJECTED"    -> "📋";
            default            -> "📌";
        };
        String message = switch (status) {
            case "SHORTLISTED" ->
                "Congratulations! You have been shortlisted for the next round. Stay prepared and check your dashboard for interview details.";
            case "INTERVIEWED" ->
                "Your interview stage has been recorded. The team is reviewing evaluations and will update your status soon.";
            case "SELECTED" ->
                "Congratulations! 🎊 You have been SELECTED! The placement team will reach out with further onboarding details shortly.";
            case "REJECTED" ->
                "Thank you for your effort. Unfortunately, you were not selected for this particular drive. Don't be discouraged — keep applying to new drives!";
            default ->
                "Your application status has been updated. Please log in to view the latest information.";
        };

        String content = """
        <h2 style="margin:0 0 8px;font-size:22px;color:#1a1a2e;font-weight:bold;">
          Application Status Update %s
        </h2>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;">Hi %s,</p>

        <div style="background:%s;border-left:4px solid %s;border-radius:0 8px 8px 0;
                    padding:16px 20px;margin-bottom:24px;">
          <div style="font-size:11px;font-weight:bold;color:#64748b;letter-spacing:1px;">COMPANY</div>
          <div style="font-size:18px;font-weight:bold;color:#1a1a2e;margin:4px 0;">%s</div>
        </div>

        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-block;background:%s;border:2px solid %s;border-radius:12px;
                      padding:14px 40px;">
            <div style="font-size:11px;font-weight:bold;color:#64748b;letter-spacing:1.5px;">
              YOUR STATUS
            </div>
            <div style="font-size:24px;font-weight:bold;color:%s;margin-top:4px;">%s</div>
          </div>
        </div>

        <div style="background:#f8fafc;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
          <p style="margin:0;font-size:13px;color:#475569;line-height:1.7;">%s</p>
        </div>

        <div style="text-align:center;">
          <a href="%s/student/applications" style="display:inline-block;background:%s;
             color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;
             padding:13px 36px;border-radius:8px;">
            View Application Details →
          </a>
        </div>
        """.formatted(
            statusIcon, firstName,
            statusBg + "40", statusColor,
            companyName,
            statusBg, statusColor, statusColor, status,
            message,
            frontendUrl, statusColor
        );

        return emailWrapper(content);
    }

    // ── New Drive Notification ────────────────────────────────────────────
    private String buildNewDriveEmail(String firstName, String companyName,
                                       String jobRole, String packageOffered,
                                       String deadline, String driveDate) {
        String content = """
        <h2 style="margin:0 0 8px;font-size:22px;color:#1a1a2e;font-weight:bold;">
          New Placement Drive 🚀
        </h2>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;">
          Hi %s, a new placement drive is now open for applications!
        </p>

        <!-- Company highlight -->
        <div style="background:linear-gradient(135deg,%s,%s);border-radius:12px;
                    padding:24px;margin-bottom:24px;text-align:center;">
          <div style="font-size:28px;font-weight:bold;color:#ffffff;margin-bottom:4px;">%s</div>
          <div style="font-size:15px;color:#a0c4e8;">%s</div>
          %s
        </div>

        <!-- Details Grid -->
        <table width="100%%" cellpadding="0" cellspacing="0"
               style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:28px;">
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;font-size:12px;font-weight:bold;color:#64748b;
                       width:150px;border-bottom:1px solid #e2e8f0;">Drive Date</td>
            <td style="padding:12px 16px;font-size:13px;color:#1a1a2e;
                       border-bottom:1px solid #e2e8f0;">%s</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:12px;font-weight:bold;color:#64748b;
                       border-bottom:1px solid #e2e8f0;">Application Deadline</td>
            <td style="padding:12px 16px;font-size:13px;font-weight:bold;color:#dc2626;
                       border-bottom:1px solid #e2e8f0;">⏰ %s</td>
          </tr>
        </table>

        <!-- CTA -->
        <div style="text-align:center;margin-bottom:16px;">
          <a href="%s/student/drives" style="display:inline-block;background:%s;
             color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;
             padding:14px 40px;border-radius:8px;letter-spacing:0.3px;">
            Apply Now →
          </a>
        </div>
        <p style="margin:0;text-align:center;font-size:12px;color:#94a3b8;">
          Log in to your CAHCET Placement Portal to view eligibility criteria and apply.
        </p>
        """.formatted(
            firstName,
            NAVY, BLUE,
            companyName,
            jobRole != null ? jobRole : "Multiple Positions",
            packageOffered != null && !packageOffered.isBlank()
                ? "<div style=\"background:%s30;border-radius:20px;display:inline-block;padding:4px 16px;margin-top:8px;font-size:13px;color:#ffffff\">💰 %s LPA</div>".formatted("#F4A700", packageOffered)
                : "",
            driveDate != null ? driveDate : "TBD",
            deadline  != null ? deadline  : "TBD",
            frontendUrl, GREEN
        );

        return emailWrapper(content);
    }

    // ─────────────────────────────────────────────────────────────────────
    // OTP VERIFICATION EMAIL
    // ─────────────────────────────────────────────────────────────────────
@Async
    public void sendOtpEmail(String toEmail, String otp, int expiryMinutes) {
        // DEV MODE: Write OTP to console/log so testing is possible without real SMTP.
        System.out.println("\n🚀=== OTP GENERATED FOR DEV ===");
        System.out.println("📧 Email: " + toEmail);
        System.out.println("🔑 OTP: " + otp);
        System.out.println("⏰ Expires in " + expiryMinutes + " minutes");
        System.out.println("===============================\n");
        log.info("🚀 DEV OTP for {}: {}", toEmail, otp);

        // Optional production email send; handle errors gracefully.
        try {
            if (mailSender != null) {
                String subject = "Your OTP for CAHCET Placement Portal Registration";
                String html = buildOtpEmail(toEmail, otp, expiryMinutes);
                sendHtml(toEmail, subject, html);
                log.info("OTP email sent to {}", toEmail);
            }
        } catch (Exception e) {
            log.warn("Failed to send OTP via SMTP for {}: {}", toEmail, e.getMessage());
            // Continue: OTP is still valid in DB, user can use logged value in dev.
        }
    }

    private String buildOtpEmail(String email, String otp, int expiryMinutes) {
        // Split OTP digits for large display
        String[] digits = otp.split("");
        StringBuilder digitBoxes = new StringBuilder();
        for (String d : digits) {
            digitBoxes.append(String.format(
                "<span style=\"display:inline-block;width:44px;height:56px;line-height:56px;" +
                "background:#f8fafc;border:2px solid #e2e8f0;border-radius:10px;" +
                "font-size:28px;font-weight:bold;color:#0A2463;text-align:center;" +
                "margin:0 4px;\">%s</span>", d));
        }

        String content = """
        <h2 style="margin:0 0 8px;font-size:22px;color:#1a1a2e;font-weight:bold;">
          Verify Your Email Address 🔐
        </h2>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;">
          You are registering for the <strong>CAHCET Placement Portal</strong>.<br>
          Please enter the OTP below to verify your email address.
        </p>

        <!-- Email being verified -->
        <div style="background:#f0f7ff;border:1.5px solid #bfdbfe;border-radius:8px;
                    padding:12px 20px;margin-bottom:28px;text-align:center;">
          <span style="font-size:12px;color:#1d4ed8;font-weight:bold;">Verifying email:</span>
          <div style="font-size:15px;font-weight:bold;color:#1e3a8a;margin-top:4px;">%s</div>
        </div>

        <!-- OTP Display -->
        <div style="text-align:center;margin-bottom:28px;">
          <p style="margin:0 0 16px;font-size:13px;color:#64748b;font-weight:600;
                    text-transform:uppercase;letter-spacing:1px;">Your One-Time Password</p>
          <div style="margin-bottom:16px;">%s</div>
          <p style="margin:0;font-size:12px;color:#94a3b8;">
            This OTP is valid for <strong>%d minutes</strong> only
          </p>
        </div>

        <!-- Warning box -->
        <div style="background:#fef3c7;border:1.5px solid #fcd34d;border-radius:8px;
                    padding:14px 18px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
            <strong>⚠️ Security Notice:</strong><br>
            Do not share this OTP with anyone. CAHCET will never ask for your OTP.<br>
            Maximum <strong>5 attempts</strong> allowed before the OTP is invalidated.
          </p>
        </div>

        <!-- Steps -->
        <div style="background:#f8fafc;border-radius:8px;padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:#374151;">
            How to complete registration:
          </p>
          <ol style="margin:0;padding-left:20px;font-size:13px;color:#475569;line-height:1.8;">
            <li>Return to the registration page</li>
            <li>Enter this 6-digit OTP in the verification box</li>
            <li>Click "Verify OTP"</li>
            <li>Complete your registration details</li>
          </ol>
        </div>
        """.formatted(email, digitBoxes.toString(), expiryMinutes);

        return emailWrapper(content);
    }
}
