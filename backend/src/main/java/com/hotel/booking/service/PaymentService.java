package com.hotel.booking.service;

import com.hotel.booking.dto.PaymentRequest;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.BookingStatus;
import com.hotel.booking.entity.Payment;
import com.hotel.booking.entity.PaymentStatus;
import com.hotel.booking.exception.ResourceNotFoundException;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.booking.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class PaymentService {
    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Transactional
    public Payment processPayment(PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + request.getBookingId()));

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotalPrice())
                .paymentStatus(PaymentStatus.COMPLETED)
                .paymentMethod(request.getPaymentMethod())
                .build();

        // Confirm booking since payment is completed
        booking.setBookingStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        Payment savedPayment = paymentRepository.save(payment);

        // Simulation notice of Email Confirmation (Stretch feature)
        logger.info("=================================================");
        logger.info("SIMULATED EMAIL CONFIRMATION SENT TO: {}", booking.getUser().getEmail());
        logger.info("Reservation ID: RSV-{}", booking.getId());
        logger.info("Hotel: {}", booking.getRoom().getHotel().getHotelName());
        logger.info("Room Type: {}", booking.getRoom().getRoomType());
        logger.info("Check-in: {}, Check-out: {}", booking.getCheckIn(), booking.getCheckOut());
        logger.info("Paid Amount: ${} via {}", payment.getAmount(), payment.getPaymentMethod());
        logger.info("=================================================");

        return savedPayment;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentByBookingId(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking id: " + bookingId));
    }
}
