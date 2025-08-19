package com.training.feedbacktool.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.name}")
    private String adminName;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendNewResponseNotification(String surveyTitle, String userName, String userEmail, Long responseId) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(adminEmail);
            message.setFrom(fromEmail);
            message.setSubject("New Survey Response Submitted - " + surveyTitle);

            String emailBody = String.format(
                    "Dear %s,\n\n" +
                            "A new response has been submitted for the survey: \"%s\"\n\n" +
                            "Response Details:\n" +
                            "- Response ID: %d\n" +
                            "- Submitted by: %s\n" +
                            "- User Email: %s\n" +
                            "- Submission Time: %s\n\n" +
                            "Please log in to the admin dashboard to view the complete response.\n\n" +
                            "Best regards,\n" +
                            "Feedback Tool System",
                    adminName,
                    surveyTitle,
                    responseId,
                    userName,
                    userEmail,
                    java.time.LocalDateTime.now().toString()
            );

            message.setText(emailBody);
            mailSender.send(message);
            logger.info("Email notification sent successfully for response ID: {}", responseId);

        } catch (Exception e) {
            logger.error("Failed to send email notification for response ID: {}", responseId, e);
            // Don’t throw exception to avoid breaking the response submission
        }
    }

    public void sendTestEmail() {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(adminEmail);
            message.setFrom(fromEmail);
            message.setSubject("Test Email - Feedback Tool");
            message.setText("This is a test email to verify email configuration is working correctly.");

            mailSender.send(message);
            logger.info("Test email sent successfully to: {}", adminEmail);

        } catch (Exception e) {
            logger.error("Failed to send test email", e);
            throw new RuntimeException("Email configuration test failed", e);
        }
    }
}
