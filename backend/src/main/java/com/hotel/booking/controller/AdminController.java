package com.hotel.booking.controller;

import com.hotel.booking.dto.StatsResponse;
import com.hotel.booking.entity.User;
import com.hotel.booking.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getDashboardStats() {
        StatsResponse stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/block/{userId}")
    public ResponseEntity<User> blockUser(@PathVariable Long userId) {
        User user = adminService.toggleUserBlockStatus(userId, true);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/unblock/{userId}")
    public ResponseEntity<User> unblockUser(@PathVariable Long userId) {
        User user = adminService.toggleUserBlockStatus(userId, false);
        return ResponseEntity.ok(user);
    }
}
