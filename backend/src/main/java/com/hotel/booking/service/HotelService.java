package com.hotel.booking.service;

import com.hotel.booking.entity.Hotel;
import com.hotel.booking.exception.ResourceNotFoundException;
import com.hotel.booking.repository.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class HotelService {

    @Autowired
    private HotelRepository hotelRepository;

    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }

    public Hotel getHotelById(Long id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
    }

    public List<Hotel> searchHotels(String location) {
        if (location == null || location.trim().isEmpty()) {
            return hotelRepository.findAll();
        }
        return hotelRepository.findByLocationContainingIgnoreCase(location);
    }

    public Hotel createHotel(Hotel hotel) {
        return hotelRepository.save(hotel);
    }

    public Hotel updateHotel(Long id, Hotel hotelDetails) {
        Hotel hotel = getHotelById(id);
        
        hotel.setHotelName(hotelDetails.getHotelName());
        hotel.setLocation(hotelDetails.getLocation());
        hotel.setDescription(hotelDetails.getDescription());
        hotel.setImage(hotelDetails.getImage());
        
        return hotelRepository.save(hotel);
    }

    public void deleteHotel(Long id) {
        Hotel hotel = getHotelById(id);
        hotelRepository.delete(hotel);
    }
}
