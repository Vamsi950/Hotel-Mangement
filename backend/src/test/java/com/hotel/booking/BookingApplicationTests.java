package com.hotel.booking;

import com.hotel.booking.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class BookingApplicationTests {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Test
    void inspectDatabase() {
        System.out.println("=== ROOMS IN DB ===");
        roomRepository.findAll().forEach(room -> {
            System.out.printf("Room ID: %d, Type: %s, Price: %s, Capacity: %d, TotalRooms: %d, Availability: %b\n",
                room.getId(), room.getRoomType(), room.getPrice(), room.getCapacity(), room.getTotalRooms(), room.isAvailability());
        });

        System.out.println("=== BOOKINGS IN DB ===");
        bookingRepository.findAll().forEach(booking -> {
            System.out.printf("Booking ID: %d, Room ID: %d, CheckIn: %s, CheckOut: %s, Status: %s, User: %s\n",
                booking.getId(), booking.getRoom().getId(), booking.getCheckIn(), booking.getCheckOut(), booking.getBookingStatus(), booking.getUser().getEmail());
        });
    }

}
