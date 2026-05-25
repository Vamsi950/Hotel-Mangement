package com.hotel.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;
    
    @Column(name = "room_type", nullable = false)
    private String roomType;
    
    @Column(nullable = false)
    private BigDecimal price;
    
    @Builder.Default
    @Column(nullable = false)
    private boolean availability = true;
    
    @Column(nullable = false)
    private int capacity;
    
    @Builder.Default
    @Column(name = "total_rooms", nullable = false)
    private int totalRooms = 1;
}
