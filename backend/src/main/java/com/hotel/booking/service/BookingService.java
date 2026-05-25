package com.hotel.booking.service;

import com.hotel.booking.dto.BookingRequest;
import com.hotel.booking.entity.*;
import com.hotel.booking.exception.BadRequestException;
import com.hotel.booking.exception.ResourceNotFoundException;
import com.hotel.booking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private EmailService emailService;

    @Transactional
    public Booking createBooking(BookingRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        if (!room.isAvailability()) {
            throw new BadRequestException("This room category is currently disabled by administration.");
        }

        // Calculate dynamic active date-overlapping bookings
        long activeBookingsCount = bookingRepository.countOverlappingBookings(
                room.getId(), 
                request.getCheckIn(), 
                request.getCheckOut(), 
                BookingStatus.CANCELLED
        );

        if (activeBookingsCount >= room.getTotalRooms()) {
            throw new BadRequestException("All rooms in this category are fully booked for the selected dates.");
        }

        if (request.getCheckIn().isAfter(request.getCheckOut()) || request.getCheckIn().isEqual(request.getCheckOut())) {
            throw new BadRequestException("Check-in date must be before check-out date.");
        }

        long days = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        if (days <= 0) days = 1;

        BigDecimal basePrice = room.getPrice().multiply(BigDecimal.valueOf(days));
        BigDecimal finalPrice = basePrice;

        // Apply discount coupon if valid
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            Coupon coupon = couponRepository.findByCouponCodeAndActive(request.getCouponCode(), true).orElse(null);
            if (coupon != null) {
                BigDecimal discount = finalPrice.multiply(BigDecimal.valueOf(coupon.getDiscountPercentage())).divide(BigDecimal.valueOf(100));
                finalPrice = finalPrice.subtract(discount);
            }
        }

        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .bookingStatus(BookingStatus.PENDING)
                .totalPrice(finalPrice)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // Trigger asynchronous email confirmation dispatch to guest and hotel owner
        emailService.sendBookingConfirmation(savedBooking);

        return savedBooking;
    }

    @Transactional
    public Booking cancelBooking(Long bookingId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // Only allow cancel if booking belongs to user or user is ADMIN
        if (!booking.getUser().getEmail().equals(userEmail) && user.getRole() != UserRole.ADMIN) {
            throw new BadRequestException("You are not authorized to cancel this booking.");
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);
        


        return bookingRepository.save(booking);
    }

    public List<Booking> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return bookingRepository.findByUserId(user.getId());
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Transactional
    public Booking updateBookingStatus(Long bookingId, String status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        BookingStatus newStatus = BookingStatus.valueOf(status.toUpperCase());
        booking.setBookingStatus(newStatus);



        return bookingRepository.save(booking);
    }
}
