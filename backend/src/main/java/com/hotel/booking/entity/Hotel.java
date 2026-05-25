package com.hotel.booking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hotels")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hotel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "hotel_name", nullable = false)
    private String hotelName;
    
    @Column(nullable = false)
    private String location;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String image;
    
    @Column(name = "owner_email")
    private String ownerEmail;
}
