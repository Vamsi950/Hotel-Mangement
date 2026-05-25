package com.hotel.booking.repository;

import com.hotel.booking.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCouponCodeAndActive(String couponCode, boolean active);
    Optional<Coupon> findByCouponCode(String couponCode);
}
