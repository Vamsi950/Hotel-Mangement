package com.hotel.booking.controller;

import com.hotel.booking.entity.Review;
import com.hotel.booking.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping("/hotel/{hotelId}")
    public ResponseEntity<Review> createReview(@PathVariable Long hotelId, @RequestBody Review review, Principal principal) {
        Review created = reviewService.createReview(hotelId, principal.getName(), review);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<Review>> getReviewsByHotel(@PathVariable Long hotelId) {
        List<Review> reviews = reviewService.getReviewsByHotel(hotelId);
        return ResponseEntity.ok(reviews);
    }
}
