package com.hotel.booking.dto;

import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Payment;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class StatsResponse {
    private BigDecimal totalRevenue;
    private long totalBookings;
    private long totalRooms;
    private long totalUsers;
    private double occupancyRate;
    private List<Booking> recentBookings;
    private List<Payment> recentPayments;
}
