package com.hotel.booking.config;

import com.hotel.booking.entity.*;
import com.hotel.booking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Users
        if (userRepository.count() == 0) {
            // Default Admin
            User admin = User.builder()
                    .name("System Admin")
                    .email("admin@hotel.com")
                    .password(passwordEncoder.encode("password"))
                    .role(UserRole.ADMIN)
                    .blocked(false)
                    .build();
            userRepository.save(admin);

            // Default Customer
            User customer = User.builder()
                    .name("John Doe")
                    .email("john@hotel.com")
                    .password(passwordEncoder.encode("password"))
                    .role(UserRole.CUSTOMER)
                    .blocked(false)
                    .build();
            userRepository.save(customer);

            System.out.println(">>> Seeded default users: admin@hotel.com / password & john@hotel.com / password");
        }

        // 2. Seed Hotels
        if (hotelRepository.count() == 0) {
            Hotel h1 = Hotel.builder()
                    .hotelName("The Grand Ritz Palace")
                    .location("New York")
                    .description("Experience world-class luxury in the heart of Manhattan. Steps away from Central Park, featuring premium spas, award-winning fine dining, and breathtaking city skyline views.")
                    .image("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800")
                    .ownerEmail("ritz.owner@hotel.com")
                    .build();

            Hotel h2 = Hotel.builder()
                    .hotelName("Ocean Breeze Resort")
                    .location("Miami")
                    .description("Escape to paradise on the white sands of Miami Beach. Ocean breeze, private beach access, infinity pools, and beachfront dining make this a perfect tropical oasis.")
                    .image("https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800")
                    .ownerEmail("ocean.owner@hotel.com")
                    .build();

            Hotel h3 = Hotel.builder()
                    .hotelName("Alpine Chalet Lodge")
                    .location("Aspen")
                    .description("Cozy winter retreat nestled in the stunning Rocky Mountains. Perfect for ski enthusiasts, featuring warm wood interiors, roaring stone fireplaces, and heated outdoor pools.")
                    .image("https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800")
                    .ownerEmail("alpine.owner@hotel.com")
                    .build();

            hotelRepository.saveAll(List.of(h1, h2, h3));
            System.out.println(">>> Seeded default hotels.");

            // 3. Seed Rooms for each hotel
            // Grand Ritz Palace (New York)
            Room r1 = Room.builder()
                    .hotel(h1)
                    .roomType("Deluxe Executive Room")
                    .price(BigDecimal.valueOf(250.00))
                    .availability(true)
                    .capacity(2)
                    .totalRooms(5)
                    .build();
            Room r2 = Room.builder()
                    .hotel(h1)
                    .roomType("Presidential Penthouse Suite")
                    .price(BigDecimal.valueOf(850.00))
                    .availability(true)
                    .capacity(4)
                    .totalRooms(2)
                    .build();

            // Ocean Breeze Resort (Miami)
            Room r3 = Room.builder()
                    .hotel(h2)
                    .roomType("Standard Ocean View")
                    .price(BigDecimal.valueOf(180.00))
                    .availability(true)
                    .capacity(2)
                    .totalRooms(5)
                    .build();
            Room r4 = Room.builder()
                    .hotel(h2)
                    .roomType("Cabana Luxury Suite")
                    .price(BigDecimal.valueOf(380.00))
                    .availability(true)
                    .capacity(3)
                    .totalRooms(3)
                    .build();

            // Alpine Chalet Lodge (Aspen)
            Room r5 = Room.builder()
                    .hotel(h3)
                    .roomType("Cozy Mountain Chalet")
                    .price(BigDecimal.valueOf(220.00))
                    .availability(true)
                    .capacity(2)
                    .totalRooms(4)
                    .build();

            roomRepository.saveAll(List.of(r1, r2, r3, r4, r5));
            System.out.println(">>> Seeded default rooms.");

            // 4. Seed Reviews
            User customer = userRepository.findByEmail("john@hotel.com").orElse(null);
            if (customer != null) {
                Review rev1 = Review.builder()
                        .hotel(h1)
                        .user(customer)
                        .rating(5)
                        .comment("Absolutely incredible stay! The service was flawless, rooms were clean, and the view was breathtaking. Highly recommend!")
                        .build();

                Review rev2 = Review.builder()
                        .hotel(h2)
                        .user(customer)
                        .rating(4)
                        .comment("Great ocean view and friendly staff. Pool area gets a bit crowded, but the beach is wonderful.")
                        .build();

                reviewRepository.saveAll(List.of(rev1, rev2));
                System.out.println(">>> Seeded default reviews.");
            }
        }

        // 5. Seed Coupons
        if (couponRepository.count() == 0) {
            Coupon c1 = Coupon.builder()
                    .couponCode("WELCOME10")
                    .discountPercentage(10)
                    .active(true)
                    .build();

            Coupon c2 = Coupon.builder()
                    .couponCode("SUMMER25")
                    .discountPercentage(25)
                    .active(true)
                    .build();

            Coupon c3 = Coupon.builder()
                    .couponCode("HOLIDAY15")
                    .discountPercentage(15)
                    .active(false) // Inactive coupon for testing
                    .build();

            couponRepository.saveAll(List.of(c1, c2, c3));
            System.out.println(">>> Seeded default coupons.");
        }

        // 6. Seed Bookings & Payments for rich mock charts
        if (bookingRepository.count() == 0) {
            User customer = userRepository.findByEmail("john@hotel.com").orElse(null);
            Room room1 = roomRepository.findAll().stream().filter(r -> r.getRoomType().contains("Deluxe")).findFirst().orElse(null);
            Room room2 = roomRepository.findAll().stream().filter(r -> r.getRoomType().contains("Standard")).findFirst().orElse(null);

            if (customer != null && room1 != null && room2 != null) {
                // Booking 1: Completed stay at Hotel 1
                Booking b1 = Booking.builder()
                        .user(customer)
                        .room(room1)
                        .checkIn(LocalDate.now().minusDays(10))
                        .checkOut(LocalDate.now().minusDays(7))
                        .bookingStatus(BookingStatus.CONFIRMED)
                        .totalPrice(BigDecimal.valueOf(750.00)) // 3 nights * $250
                        .build();
                bookingRepository.save(b1);

                Payment p1 = Payment.builder()
                        .booking(b1)
                        .amount(b1.getTotalPrice())
                        .paymentStatus(PaymentStatus.COMPLETED)
                        .paymentMethod("Credit Card")
                        .build();
                paymentRepository.save(p1);

                // Booking 2: Upcoming stay at Hotel 2
                Booking b2 = Booking.builder()
                        .user(customer)
                        .room(room2)
                        .checkIn(LocalDate.now().plusDays(2))
                        .checkOut(LocalDate.now().plusDays(5))
                        .bookingStatus(BookingStatus.CONFIRMED)
                        .totalPrice(BigDecimal.valueOf(540.00)) // 3 nights * $180
                        .build();
                
                bookingRepository.save(b2);

                Payment p2 = Payment.builder()
                        .booking(b2)
                        .amount(b2.getTotalPrice())
                        .paymentStatus(PaymentStatus.COMPLETED)
                        .paymentMethod("PayPal")
                        .build();
                paymentRepository.save(p2);

                // Booking 3: Cancelled Stay
                Booking b3 = Booking.builder()
                        .user(customer)
                        .room(room1)
                        .checkIn(LocalDate.now().minusDays(2))
                        .checkOut(LocalDate.now().plusDays(1))
                        .bookingStatus(BookingStatus.CANCELLED)
                        .totalPrice(BigDecimal.valueOf(750.00))
                        .build();
                bookingRepository.save(b3);

                System.out.println(">>> Seeded default mock bookings & payments for admin analytics dashboard.");
            }
        }

        // Automatic recovery for pre-existing MySQL rooms whose total_rooms defaulted to 0 on Hibernate schema update
        List<Room> allRooms = roomRepository.findAll();
        boolean databaseNeedsFix = false;
        for (Room r : allRooms) {
            if (r.getTotalRooms() <= 0) {
                int capacity = 1;
                String type = r.getRoomType().toLowerCase();
                if (type.contains("deluxe")) capacity = 5;
                else if (type.contains("penthouse")) capacity = 2;
                else if (type.contains("standard")) capacity = 5;
                else if (type.contains("cabana")) capacity = 3;
                else if (type.contains("chalet")) capacity = 4;
                else if (type.contains("sharing")) capacity = 3;
                else capacity = 3; // safe fallback
                
                r.setTotalRooms(capacity);
                databaseNeedsFix = true;
            }
        }
        if (databaseNeedsFix) {
            roomRepository.saveAll(allRooms);
            System.out.println(">>> [AUTO FIX] Successfully upgraded pre-existing room total capacities from 0 to realistic default sizes!");
        }
    }
}
