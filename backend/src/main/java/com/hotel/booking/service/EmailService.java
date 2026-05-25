package com.hotel.booking.service;

import com.hotel.booking.entity.Booking;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.time.temporal.ChronoUnit;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${hotel.owner.email:admin@hotel.com}")
    private String hotelOwnerEmail;

    @Value("${spring.mail.username:your-email@gmail.com}")
    private String fromEmail;

    @Async
    public void sendBookingConfirmation(Booking booking) {
        String ownerMail = booking.getRoom().getHotel().getOwnerEmail();
        if (ownerMail == null || ownerMail.trim().isEmpty()) {
            ownerMail = hotelOwnerEmail;
        }

        String guestName = booking.getUser().getName();
        String guestEmail = booking.getUser().getEmail();
        String bookingCode = "BK-" + booking.getId();
        String hotelName = booking.getRoom().getHotel().getHotelName();
        String hotelLocation = booking.getRoom().getHotel().getLocation();
        String roomType = booking.getRoom().getRoomType();
        String checkIn = booking.getCheckIn().toString();
        String checkOut = booking.getCheckOut().toString();
        String price = "$" + String.format("%.2f", booking.getTotalPrice());
        
        long nights = ChronoUnit.DAYS.between(booking.getCheckIn(), booking.getCheckOut());
        if (nights <= 0) nights = 1;

        // --- 1. Construct HTML Body for the Guest ---
        String guestHtml = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "  <style>" +
            "    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; margin: 0; }" +
            "    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }" +
            "    .header { background: #0f172a; padding: 30px; text-align: center; color: #ffffff; }" +
            "    .header h1 { font-family: 'Montserrat', sans-serif; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }" +
            "    .header p { font-size: 14px; opacity: 0.8; margin: 5px 0 0 0; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }" +
            "    .content { padding: 30px; }" +
            "    .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; }" +
            "    .summary-table { width: 100%%; border-collapse: collapse; margin: 20px 0; border: 1px solid #f1f5f9; border-radius: 8px; overflow: hidden; }" +
            "    .summary-table th { background: #f8fafc; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; padding: 12px 15px; border-bottom: 2px solid #e2e8f0; text-align: left; }" +
            "    .summary-table td { padding: 14px 15px; border-bottom: 1px solid #f1f5f9; font-size: 14px; text-align: left; }" +
            "    .price-value { font-size: 18px; font-weight: 800; color: #FF7A00; }" +
            "    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }" +
            "  </style>" +
            "</head>" +
            "<body>" +
            "  <div class='card'>" +
            "    <div class='header'>" +
            "      <h1>LuxeStay</h1>" +
            "      <p>Booking Confirmed</p>" +
            "    </div>" +
            "    <div class='content'>" +
            "      <p class='greeting'>Hello %s,</p>" +
            "      <p>Thank you for choosing LuxeStay. We are delighted to confirm your upcoming luxury retreat. Below are your booking reservation details:</p>" +
            "      <table class='summary-table'>" +
            "        <thead>" +
            "          <tr>" +
            "            <th colspan='2'>Reservation Summary (#%s)</th>" +
            "          </tr>" +
            "        </thead>" +
            "        <tbody>" +
            "          <tr><td><strong>Destination Retreat</strong></td><td>%s, %s</td></tr>" +
            "          <tr><td><strong>Room Specification</strong></td><td>%s</td></tr>" +
            "          <tr><td><strong>Duration of Stay</strong></td><td>%d Nights</td></tr>" +
            "          <tr><td><strong>Check-In Date</strong></td><td>%s (Standard 3:00 PM)</td></tr>" +
            "          <tr><td><strong>Check-Out Date</strong></td><td>%s (Standard 11:00 AM)</td></tr>" +
            "          <tr><td><strong>Grand Total Price</strong></td><td class='price-value'>%s</td></tr>" +
            "        </tbody>" +
            "      </table>" +
            "      <p>Our concierge staff is already preparing for your arrival. Should you need personalized services, dining reservations, or airport transfers, please don't hesitate to reach out.</p>" +
            "    </div>" +
            "    <div class='footer'>" +
            "      &copy; 2026 LuxeStay Global. All rights reserved.<br/>Elevating the standard of institutional luxury travel." +
            "    </div>" +
            "  </div>" +
            "</body>" +
            "</html>",
            guestName, bookingCode, hotelName, hotelLocation, roomType, nights, checkIn, checkOut, price
        );

        // --- 2. Construct HTML Body for the Hotel Owner / Admin ---
        String adminHtml = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "  <style>" +
            "    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; margin: 0; }" +
            "    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }" +
            "    .header { background: #0f172a; padding: 30px; text-align: center; color: #ffffff; }" +
            "    .header h1 { font-family: 'Montserrat', sans-serif; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }" +
            "    .header p { font-size: 14px; opacity: 0.8; margin: 5px 0 0 0; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }" +
            "    .content { padding: 30px; }" +
            "    .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; }" +
            "    .summary-table { width: 100%%; border-collapse: collapse; margin: 20px 0; border: 1px solid #f1f5f9; border-radius: 8px; overflow: hidden; }" +
            "    .summary-table th { background: #f8fafc; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; padding: 12px 15px; border-bottom: 2px solid #e2e8f0; text-align: left; }" +
            "    .summary-table td { padding: 14px 15px; border-bottom: 1px solid #f1f5f9; font-size: 14px; text-align: left; }" +
            "    .price-value { font-size: 18px; font-weight: 800; color: #FF7A00; }" +
            "    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }" +
            "  </style>" +
            "</head>" +
            "<body>" +
            "  <div class='card'>" +
            "    <div class='header'>" +
            "      <h1>LuxeStay Console</h1>" +
            "      <p>New Reservation Alert</p>" +
            "    </div>" +
            "    <div class='content'>" +
            "      <p class='greeting'>Attention Operations Console,</p>" +
            "      <p>A new luxury reservation has been confirmed and finalized. Details are mapped below:</p>" +
            "      <table class='summary-table'>" +
            "        <thead>" +
            "          <tr>" +
            "            <th colspan='2'>System Particulars (#%s)</th>" +
            "          </tr>" +
            "        </thead>" +
            "        <tbody>" +
            "          <tr><td><strong>Guest Name</strong></td><td>%s</td></tr>" +
            "          <tr><td><strong>Guest Email</strong></td><td>%s</td></tr>" +
            "          <tr><td><strong>Destination Retreat</strong></td><td>%s, %s</td></tr>" +
            "          <tr><td><strong>Room Specification</strong></td><td>%s</td></tr>" +
            "          <tr><td><strong>Stay Duration</strong></td><td>%d Nights</td></tr>" +
            "          <tr><td><strong>Check-In Date</strong></td><td>%s</td></tr>" +
            "          <tr><td><strong>Check-Out Date</strong></td><td>%s</td></tr>" +
            "          <tr><td><strong>Total Revenue Earned</strong></td><td class='price-value'>%s</td></tr>" +
            "        </tbody>" +
            "      </table>" +
            "      <p>The inventory has been locked automatically. Please ensure logistics, room inspection, and check-in greeting card configurations are complete.</p>" +
            "    </div>" +
            "    <div class='footer'>" +
            "      LuxeStay Operations Control &copy; 2026." +
            "    </div>" +
            "  </div>" +
            "</body>" +
            "</html>",
            bookingCode, guestName, guestEmail, hotelName, hotelLocation, roomType, nights, checkIn, checkOut, price
        );

        // --- 3. Trigger Email Dispatching with Offline Mock Fallbacks ---
        boolean mailSentSuccessfully = false;
        if (mailSender != null && fromEmail != null) {
            try {
                // Send to Guest
                MimeMessage guestMessage = mailSender.createMimeMessage();
                MimeMessageHelper guestHelper = new MimeMessageHelper(guestMessage, true, "UTF-8");
                guestHelper.setFrom(fromEmail);
                guestHelper.setTo(guestEmail);
                guestHelper.setSubject("LuxeStay Booking Confirmation: #" + bookingCode);
                guestHelper.setText(guestHtml, true);
                mailSender.send(guestMessage);

                // Send to Hotel Owner / Admin
                MimeMessage adminMessage = mailSender.createMimeMessage();
                MimeMessageHelper adminHelper = new MimeMessageHelper(adminMessage, true, "UTF-8");
                adminHelper.setFrom(fromEmail);
                adminHelper.setTo(ownerMail);
                adminHelper.setSubject("New LuxeStay Booking Alert: #" + bookingCode);
                adminHelper.setText(adminHtml, true);
                mailSender.send(adminMessage);

                mailSentSuccessfully = true;
                System.out.println(">>> [MAIL SUCCESS] Emails successfully dispatched to Guest (" + guestEmail + ") and Hotel Owner (" + ownerMail + ").");
            } catch (Exception e) {
                System.err.println(">>> [MAIL ERROR] Failed to dispatch real SMTP emails. Error: " + e.getMessage());
                e.printStackTrace();
            }
        }

        // --- 4. Mock Fallback Console Logging (Super handy for dev environment!) ---
        if (!mailSentSuccessfully) {
            System.out.println("\n=============================================================================================");
            System.out.println(">>> [MAIL MOCK CONSOLE FALLBACK]");
            System.out.println("    Note: Real SMTP credentials not configured/offline. Mocking email output below:");
            System.out.println("---------------------------------------------------------------------------------------------");
            System.out.println("    [TO GUEST] Email: " + guestEmail);
            System.out.println("    [SUBJECT] LuxeStay Booking Confirmation: #" + bookingCode);
            System.out.println("    [BODY PREVIEW] " + guestName + ", your stay at " + hotelName + " (" + roomType + ") is confirmed.");
            System.out.println("---------------------------------------------------------------------------------------------");
            System.out.println("    [TO OWNER] Email: " + ownerMail);
            System.out.println("    [SUBJECT] New LuxeStay Booking Alert: #" + bookingCode);
            System.out.println("    [BODY PREVIEW] Alert: New stay from " + guestName + " (" + guestEmail + ") for " + price);
            System.out.println("=============================================================================================\n");
        }
    }
}
