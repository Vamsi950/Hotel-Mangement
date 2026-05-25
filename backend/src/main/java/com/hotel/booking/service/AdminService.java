package com.hotel.booking.service;

import com.hotel.booking.dto.StatsResponse;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.BookingStatus;
import com.hotel.booking.entity.Payment;
import com.hotel.booking.entity.User;
import com.hotel.booking.exception.BadRequestException;
import com.hotel.booking.exception.ResourceNotFoundException;
import com.hotel.booking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    public StatsResponse getDashboardStats() {
        List<Payment> payments = paymentRepository.findAll();
        BigDecimal totalRevenue = payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalBookings = bookingRepository.count();
        long totalRooms = roomRepository.count();
        long totalUsers = userRepository.count();

        // Calculate occupancy rate (CONFIRMED bookings / total rooms)
        long activeBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED)
                .count();

        double occupancyRate = totalRooms > 0 
                ? ((double) activeBookings / totalRooms) * 100 
                : 0.0;

        // Fetch recent items (e.g., top 10 or all)
        List<Booking> bookings = bookingRepository.findAll();
        List<Booking> recentBookings = bookings.size() > 10 
                ? bookings.subList(bookings.size() - 10, bookings.size()) 
                : bookings;

        List<Payment> recentPayments = payments.size() > 10 
                ? payments.subList(payments.size() - 10, payments.size()) 
                : payments;

        return StatsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalBookings(totalBookings)
                .totalRooms(totalRooms)
                .totalUsers(totalUsers)
                .occupancyRate(occupancyRate)
                .recentBookings(recentBookings)
                .recentPayments(recentPayments)
                .build();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User toggleUserBlockStatus(Long userId, boolean block) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        if (block && "admin@hotel.com".equalsIgnoreCase(user.getEmail())) {
            throw new BadRequestException("System Admin account cannot be blocked.");
        }
        
        user.setBlocked(block);
        return userRepository.save(user);
    }
}
