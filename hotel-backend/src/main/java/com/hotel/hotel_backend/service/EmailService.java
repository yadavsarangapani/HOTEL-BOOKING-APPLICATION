package com.hotel.hotel_backend.service;

import com.hotel.hotel_backend.entity.Booking;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendRegistrationConfirmation(String toEmail, String userName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to LuxStay Hotels – Registration Confirmed!");
            helper.setText(buildRegistrationEmailHtml(userName), true);
            mailSender.send(message);
            log.info("Registration confirmation email sent to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send registration email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendBookingConfirmation(String toEmail, String userName, Booking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Booking Confirmed – Booking #" + booking.getId());
            helper.setText(buildBookingConfirmationHtml(userName, booking), true);
            mailSender.send(message);
            log.info("Booking confirmation email sent to: {} for booking: {}", toEmail, booking.getId());
        } catch (MessagingException e) {
            log.error("Failed to send booking confirmation to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendCancellationNotification(String toEmail, String userName, Booking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Booking Cancelled – Booking #" + booking.getId());
            helper.setText(buildCancellationEmailHtml(userName, booking), true);
            mailSender.send(message);
            log.info("Cancellation email sent to: {} for booking: {}", toEmail, booking.getId());
        } catch (MessagingException e) {
            log.error("Failed to send cancellation email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String userName, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Reset Your LuxStay Password");
            helper.setText(buildPasswordResetHtml(userName, token), true);
            mailSender.send(message);
            log.info("Password reset email sent to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send reset email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildRegistrationEmailHtml(String userName) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;border-radius:12px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:40px;text-align:center;">
                <h1 style="color:#d4af37;margin:0;font-size:28px;">LuxStay Hotels</h1>
                <p style="color:#ccc;margin:8px 0 0;">Your Premium Accommodation Partner</p>
              </div>
              <div style="padding:40px;background:#fff;">
                <h2 style="color:#1a1a2e;">Welcome, %s!</h2>
                <p style="color:#555;line-height:1.6;">Your account has been successfully created. We're thrilled to have you as part of the LuxStay family.</p>
                <p style="color:#555;line-height:1.6;">Start exploring our curated collection of premium hotels and book your next unforgettable stay.</p>
                <div style="text-align:center;margin:30px 0;">
                  <a href="http://localhost:3000" style="background:#d4af37;color:#1a1a2e;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">Explore Hotels</a>
                </div>
              </div>
              <div style="background:#f0f0f0;padding:20px;text-align:center;">
                <p style="color:#999;font-size:12px;margin:0;">© 2024 LuxStay Hotels. All rights reserved.</p>
              </div>
            </div>
        """.formatted(userName);
    }

    private String buildBookingConfirmationHtml(String userName, Booking booking) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;border-radius:12px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:40px;text-align:center;">
                <h1 style="color:#d4af37;margin:0;font-size:28px;">LuxStay Hotels</h1>
                <p style="color:#ccc;margin:8px 0 0;">Booking Confirmed ✓</p>
              </div>
              <div style="padding:40px;background:#fff;">
                <h2 style="color:#1a1a2e;">Hello, %s!</h2>
                <p style="color:#555;">Your booking has been confirmed. Here are your details:</p>
                <div style="background:#f8f8f8;border-radius:8px;padding:24px;margin:20px 0;border-left:4px solid #d4af37;">
                  <p style="margin:8px 0;color:#333;"><strong>Booking ID:</strong> #%d</p>
                  <p style="margin:8px 0;color:#333;"><strong>Hotel:</strong> %s</p>
                  <p style="margin:8px 0;color:#333;"><strong>Room Type:</strong> %s</p>
                  <p style="margin:8px 0;color:#333;"><strong>Check-in:</strong> %s</p>
                  <p style="margin:8px 0;color:#333;"><strong>Check-out:</strong> %s</p>
                  <p style="margin:8px 0;color:#333;"><strong>Total Price:</strong> ₹%.2f</p>
                  <p style="margin:8px 0;color:#27ae60;"><strong>Status:</strong> CONFIRMED</p>
                </div>
                <div style="text-align:center;margin:30px 0;">
                  <a href="http://localhost:3000/my-bookings" style="background:#d4af37;color:#1a1a2e;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">View My Bookings</a>
                </div>
              </div>
              <div style="background:#f0f0f0;padding:20px;text-align:center;">
                <p style="color:#999;font-size:12px;margin:0;">© 2024 LuxStay Hotels. All rights reserved.</p>
              </div>
            </div>
        """.formatted(userName, booking.getId(),
                booking.getRoom().getHotel().getName(),
                booking.getRoom().getRoomType(),
                booking.getCheckInDate(),
                booking.getCheckOutDate(),
                booking.getTotalPrice().doubleValue());
    }

    private String buildCancellationEmailHtml(String userName, Booking booking) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;border-radius:12px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#c0392b,#96281b);padding:40px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:28px;">LuxStay Hotels</h1>
                <p style="color:#f0c0bb;margin:8px 0 0;">Booking Cancelled</p>
              </div>
              <div style="padding:40px;background:#fff;">
                <h2 style="color:#1a1a2e;">Hello, %s</h2>
                <p style="color:#555;">Your booking has been cancelled as requested.</p>
                <div style="background:#fff5f5;border-radius:8px;padding:24px;margin:20px 0;border-left:4px solid #e74c3c;">
                  <p style="margin:8px 0;color:#333;"><strong>Booking ID:</strong> #%d</p>
                  <p style="margin:8px 0;color:#333;"><strong>Hotel:</strong> %s</p>
                  <p style="margin:8px 0;color:#333;"><strong>Room Type:</strong> %s</p>
                  <p style="margin:8px 0;color:#e74c3c;"><strong>Status:</strong> CANCELLED</p>
                </div>
                <p style="color:#555;">We hope to welcome you back soon. Browse our latest offers below.</p>
                <div style="text-align:center;margin:30px 0;">
                  <a href="http://localhost:3000" style="background:#1a1a2e;color:#d4af37;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">Browse Hotels</a>
                </div>
              </div>
              <div style="background:#f0f0f0;padding:20px;text-align:center;">
                <p style="color:#999;font-size:12px;margin:0;">© 2024 LuxStay Hotels. All rights reserved.</p>
              </div>
            </div>
        """.formatted(userName, booking.getId(),
                booking.getRoom().getHotel().getName(),
                booking.getRoom().getRoomType());
    }

    private String buildPasswordResetHtml(String userName, String token) {
        String resetUrl = "http://localhost:3000/reset-password?token=" + token;
        return """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;border-radius:12px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:40px;text-align:center;">
                <h1 style="color:#d4af37;margin:0;font-size:28px;">LuxStay Hotels</h1>
                <p style="color:#ccc;margin:8px 0 0;">Secure Password Reset</p>
              </div>
              <div style="padding:40px;background:#fff;">
                <h2 style="color:#1a1a2e;">Hello, %s</h2>
                <p style="color:#555;line-height:1.6;">We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
                <div style="text-align:center;margin:30px 0;">
                  <a href="%s" style="background:#d4af37;color:#1a1a2e;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">Reset Password</a>
                </div>
                <p style="color:#999;font-size:13px;">This link will expire in 15 minutes for your security.</p>
              </div>
              <div style="background:#f0f0f0;padding:20px;text-align:center;">
                <p style="color:#999;font-size:12px;margin:0;">© 2024 LuxStay Hotels. All rights reserved.</p>
              </div>
            </div>
        """.formatted(userName, resetUrl);
    }
}

