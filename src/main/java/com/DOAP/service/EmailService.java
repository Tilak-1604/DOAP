package com.DOAP.service;

import com.DOAP.entity.Booking;
import com.DOAP.entity.Screen;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Async
    public void sendMail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            javaMailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
        }
    }

    @Async
    public void sendRegistrationEmail(String to, String name, String role) {
        String subject = "Welcome to DOAP - Registration Successful";
        String body = String.format("""
                Hello %s,

                Welcome to DOAP! Your registration was successful.

                Username/Email: %s
                Role: %s

                We are excited to have you on board.

                Best Regards,
                Team DOAP
                """, name, to, role);

        sendMail(to, subject, body);
    }

    @Async
    public void sendBookingConfirmationEmail(String advertiserEmail, String ownerEmail,
            Booking booking, Screen screen,
            Double price, Double ownerEarning) {

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        String timeSlot = booking.getStartDatetime().format(formatter) + " to " +
                booking.getEndDatetime().format(formatter);

        // Email to Advertiser
        String advertiserSubject = "DOAP - Booking Confirmed";
        String advertiserBody = String.format("""
                Hello,

                Your booking has been successfully CONFIRMED!

                Screen Name: %s
                Location: %s
                Time Slot: %s
                Amount Paid: ₹%.2f

                Thank you for choosing DOAP.
                """, screen.getScreenName(), screen.getLocation(), timeSlot, price);

        sendMail(advertiserEmail, advertiserSubject, advertiserBody);

        // Email to Screen Owner
        String ownerSubject = "DOAP - New Booking Received";
        String ownerBody = String.format("""
                Hello,

                Good news! You have received a new booking.

                Screen Name: %s
                Time Slot: %s
                Parameters: %s
                Your Earnings: ₹%.2f

                Keep up the great work!
                """, screen.getScreenName(), timeSlot, "Standard", ownerEarning);

        sendMail(ownerEmail, ownerSubject, ownerBody);
    }

    @Async
    public void sendBookingCancellationEmail(String advertiserEmail, Booking booking, Screen screen,
            Double refundAmount) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        String timeSlot = booking.getStartDatetime().format(formatter) + " to " +
                booking.getEndDatetime().format(formatter);

        String subject = "DOAP - Booking Cancelled";
        String body = String.format("""
                Hello,

                Your booking has been CANCELLED.

                Screen Name: %s
                Time Slot: %s
                Refund Amount: ₹%.2f

                We hope to serve you again soon.
                """, screen.getScreenName(), timeSlot, refundAmount);

        sendMail(advertiserEmail, subject, body);
    }

    @Async
    public void sendScreenAddedEmail(String ownerEmail, String screenName, String status) {
        String subject = "DOAP - New Screen Added";
        String body = String.format("""
                Hello,

                Your screen "%s" has been successfully added to the platform.

                Current Status: %s

                %s

                Best Regards,
                Team DOAP
                """, screenName, status,
                status.equals("PENDING_APPROVAL") ? "Our admin team will review it shortly."
                        : "It is now live and visible to advertisers.");

        sendMail(ownerEmail, subject, body);
    }
}
