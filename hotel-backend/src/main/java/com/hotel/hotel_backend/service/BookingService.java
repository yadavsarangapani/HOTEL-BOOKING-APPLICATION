package com.hotel.hotel_backend.service;

import com.hotel.hotel_backend.dto.BookingDTO;
import com.hotel.hotel_backend.dto.ResponseDTO;
import com.hotel.hotel_backend.entity.Booking;
import com.hotel.hotel_backend.entity.Room;
import com.hotel.hotel_backend.entity.User;
import com.hotel.hotel_backend.exception.OurException;
import com.hotel.hotel_backend.exception.ResourceNotFoundException;
import com.hotel.hotel_backend.repository.BookingRepository;
import com.hotel.hotel_backend.repository.RoomRepository;
import com.hotel.hotel_backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    @Autowired private BookingRepository bookingRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private EmailService emailService;

    public ResponseDTO<BookingDTO> createBooking(Long userId, BookingDTO request) {
        log.info("Creating booking for user {} room {}", userId, request.getRoomId());

        if (request.getCheckInDate().isEqual(request.getCheckOutDate()) ||
            request.getCheckInDate().isAfter(request.getCheckOutDate())) {
            throw new OurException("Check-out date must be after check-in date");
        }
        if (request.getCheckInDate().isBefore(LocalDate.now())) {
            throw new OurException("Check-in date cannot be in the past");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        if (!room.isAvailabilityStatus()) {
            throw new OurException("Room is not available");
        }

        // Check for conflicting bookings
        List<Booking> conflicts = bookingRepository.findByRoomIdOrderByCreatedAtDesc(room.getId())
                .stream().filter(b -> !b.getStatus().equals("CANCELLED"))
                .filter(b -> request.getCheckInDate().isBefore(b.getCheckOutDate()) &&
                             request.getCheckOutDate().isAfter(b.getCheckInDate()))
                .collect(Collectors.toList());

        if (!conflicts.isEmpty()) {
            throw new OurException("Room is already booked for the selected dates");
        }

        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal totalPrice = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        Booking booking = Booking.builder()
                .user(user).room(room)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .totalPrice(totalPrice)
                .numGuests(request.getNumGuests())
                .specialRequests(request.getSpecialRequests())
                .status("PENDING_PAYMENT")
                .build();

        Booking saved = bookingRepository.save(booking);
        log.info("Booking created in PENDING_PAYMENT: {} for user: {}", saved.getId(), userId);

        // Send confirmation email immediately (even if payment is pending)
        emailService.sendBookingConfirmation(user.getEmail(), user.getName(), saved);

        return ResponseDTO.success("Booking created, confirmation email sent. Please complete payment.", toDTO(saved));
    }

    public ResponseDTO<BookingDTO> cancelBooking(Long bookingId, Long userId) {
        log.info("Processing cancellation for booking {} by user {}", bookingId, userId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new OurException("You can only cancel your own bookings");
        }
        
        String currentStatus = booking.getStatus();
        if ("CANCELLED".equals(currentStatus) || "REFUNDED".equals(currentStatus) || "REFUND_REQUESTED".equals(currentStatus)) {
            throw new OurException("Booking is already in a cancelled or refund-processing state");
        }

        if (booking.getCheckInDate().isBefore(LocalDate.now())) {
            throw new OurException("Cannot cancel past or ongoing bookings");
        }

        if ("CONFIRMED".equals(currentStatus)) {
            booking.setStatus("REFUND_REQUESTED");
            log.info("Refund request initiated for booking {} by user {}", bookingId, userId);
        } else {
            booking.setStatus("CANCELLED");
            log.info("Booking {} cancelled directly by user {}", bookingId, userId);
        }

        Booking saved = bookingRepository.save(booking);

        if ("CANCELLED".equals(saved.getStatus())) {
            emailService.sendCancellationNotification(
                    booking.getUser().getEmail(), booking.getUser().getName(), saved);
        } else {
            // Logically you might want a refund request email, but for now we'll keep it simple
            log.info("Refund request stored for admin review.");
        }

        String msg = "CANCELLED".equals(saved.getStatus()) ? "Booking cancelled successfully" : "Refund request submitted. Admin will process it soon.";
        return ResponseDTO.success(msg, toDTO(saved));
    }

    public ResponseDTO<BookingDTO> approveRefund(Long bookingId) {
        log.info("Admin approving refund for booking {}", bookingId);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!"REFUND_REQUESTED".equals(booking.getStatus())) {
            throw new OurException("Booking is not in REFUND_REQUESTED status");
        }

        booking.setStatus("REFUNDED");
        Booking saved = bookingRepository.save(booking);
        
        emailService.sendCancellationNotification(
                booking.getUser().getEmail(), booking.getUser().getName(), saved);

        log.info("Booking {} marked as REFUNDED by admin", bookingId);
        return ResponseDTO.success("Refund approved successfully", toDTO(saved));
    }

    public ResponseDTO<List<BookingDTO>> getUserBookings(Long userId) {
        List<BookingDTO> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseDTO.success("Bookings fetched", bookings);
    }

    public ResponseDTO<BookingDTO> getBookingById(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getUser().getId().equals(userId)) {
            throw new OurException("Access denied");
        }
        return ResponseDTO.success("Booking fetched", toDTO(booking));
    }

    // Admin
    public ResponseDTO<List<BookingDTO>> getAllBookings() {
        List<BookingDTO> bookings = bookingRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseDTO.success("All bookings fetched", bookings);
    }

    private BookingDTO toDTO(Booking b) {
        return BookingDTO.builder()
                .id(b.getId())
                .roomId(b.getRoom().getId())
                .hotelId(b.getRoom().getHotel().getId())
                .hotelName(b.getRoom().getHotel().getName())
                .hotelLocation(b.getRoom().getHotel().getLocation())
                .roomType(b.getRoom().getRoomType())
                .roomImageUrl(b.getRoom().getImageUrl())
                .userId(b.getUser().getId())
                .userName(b.getUser().getName())
                .userEmail(b.getUser().getEmail())
                .checkInDate(b.getCheckInDate())
                .checkOutDate(b.getCheckOutDate())
                .totalPrice(b.getTotalPrice())
                .status(b.getStatus())
                .numGuests(b.getNumGuests())
                .specialRequests(b.getSpecialRequests())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
