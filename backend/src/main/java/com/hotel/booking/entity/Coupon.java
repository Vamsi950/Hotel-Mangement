package com.hotel.booking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "coupon_code", nullable = false, unique = true)
    private String couponCode;
    
    @Column(name = "discount_percentage", nullable = false)
    private int discountPercentage;
    
    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;
}
