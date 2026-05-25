package com.hotel.booking.service;

import com.hotel.booking.entity.Hotel;
import com.hotel.booking.entity.Review;
import com.hotel.booking.entity.User;
import com.hotel.booking.exception.ResourceNotFoundException;
import com.hotel.booking.repository.HotelRepository;
import com.hotel.booking.repository.ReviewRepository;
import com.hotel.booking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private UserRepository userRepository;

    public Review createReview(Long hotelId, String userEmail, Review review) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        review.setHotel(hotel);
        review.setUser(user);
        review.setCreatedAt(LocalDateTime.now());
        
        return reviewRepository.save(review);
    }

    public List<Review> getReviewsByHotel(Long hotelId) {
        return reviewRepository.findByHotelId(hotelId);
    }
}
