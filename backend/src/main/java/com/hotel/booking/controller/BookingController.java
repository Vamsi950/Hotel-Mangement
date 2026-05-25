package com.hotel.booking.controller;

import com.hotel.booking.dto.BookingRequest;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody BookingRequest bookingRequest, Principal principal) {
        Booking booking = bookingService.createBooking(bookingRequest, principal.getName());
        return ResponseEntity.ok(booking);
    }

    @PostMapping("/cancel/{bookingId}")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long bookingId, Principal principal) {
        Booking booking = bookingService.cancelBooking(bookingId, principal.getName());
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<Booking>> getMyBookings(Principal principal) {
        List<Booking> bookings = bookingService.getMyBookings(principal.getName());
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @PutMapping("/status/{bookingId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> updateBookingStatus(@PathVariable Long bookingId, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        Booking updated = bookingService.updateBookingStatus(bookingId, status);
        return ResponseEntity.ok(updated);
    }
}
