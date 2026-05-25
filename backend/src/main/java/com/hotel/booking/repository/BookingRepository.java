package com.hotel.booking.repository;

import com.hotel.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.hotel.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByRoomId(Long roomId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.room.id = :roomId AND b.bookingStatus <> :status AND b.checkIn < :checkOut AND b.checkOut > :checkIn")
    long countOverlappingBookings(
        @Param("roomId") Long roomId, 
        @Param("checkIn") LocalDate checkIn, 
        @Param("checkOut") LocalDate checkOut, 
        @Param("status") BookingStatus status
    );
}
