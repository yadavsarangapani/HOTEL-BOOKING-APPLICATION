package com.hotel.hotel_backend.controller;

import com.hotel.hotel_backend.dto.*;
import com.hotel.hotel_backend.entity.User;
import com.hotel.hotel_backend.service.BookingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private static final Logger log = LoggerFactory.getLogger(BookingController.class);

    @Autowired
    private BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ResponseDTO<BookingDTO>> createBooking(
            @AuthenticationPrincipal User user,
            @RequestBody BookingDTO request) {
        log.info("POST /api/bookings - user: {}", user.getId());
        return ResponseEntity.ok(bookingService.createBooking(user.getId(), request));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ResponseDTO<List<BookingDTO>>> getMyBookings(
            @AuthenticationPrincipal User user) {
        log.info("GET /api/bookings/my - user: {}", user.getId());
        return ResponseEntity.ok(bookingService.getUserBookings(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseDTO<BookingDTO>> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.getBookingById(id, user.getId()));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ResponseDTO<BookingDTO>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        log.info("PUT /api/bookings/{}/cancel - user: {}", id, user.getId());
        return ResponseEntity.ok(bookingService.cancelBooking(id, user.getId()));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO<List<BookingDTO>>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @PutMapping("/admin/{id}/approve-refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO<BookingDTO>> approveRefund(@PathVariable Long id) {
        log.info("PUT /api/bookings/admin/{}/approve-refund", id);
        return ResponseEntity.ok(bookingService.approveRefund(id));
    }
}
