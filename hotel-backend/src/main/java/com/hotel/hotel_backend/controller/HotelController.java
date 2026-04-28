package com.hotel.hotel_backend.controller;

import com.hotel.hotel_backend.dto.*;
import com.hotel.hotel_backend.service.HotelService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class HotelController {

    private static final Logger log = LoggerFactory.getLogger(HotelController.class);

    @Autowired
    private HotelService hotelService;

    // ===== PUBLIC ENDPOINTS =====

    @GetMapping("/hotels")
    public ResponseEntity<ResponseDTO<List<HotelDTO>>> getAllHotels() {
        log.info("GET /api/hotels");
        return ResponseEntity.ok(hotelService.getAllHotels());
    }

    @GetMapping("/hotels/{id}")
    public ResponseEntity<ResponseDTO<HotelDTO>> getHotelById(@PathVariable Long id) {
        log.info("GET /api/hotels/{}", id);
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }

    @GetMapping("/hotels/search")
    public ResponseEntity<ResponseDTO<List<HotelDTO>>> searchHotels(
            @RequestParam String location) {
        log.info("GET /api/hotels/search?location={}", location);
        return ResponseEntity.ok(hotelService.searchByLocation(location));
    }

    @GetMapping("/hotels/locations")
    public ResponseEntity<ResponseDTO<List<String>>> getLocations() {
        return ResponseEntity.ok(hotelService.getAllLocations());
    }

    @GetMapping("/rooms/search")
    public ResponseEntity<ResponseDTO<List<RoomDTO>>> searchAvailableRooms(
            @RequestParam String location,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        log.info("GET /api/rooms/search?location={}&checkIn={}&checkOut={}", location, checkIn, checkOut);
        return ResponseEntity.ok(hotelService.searchAvailableRooms(location, checkIn, checkOut));
    }

    @GetMapping("/hotels/{hotelId}/rooms")
    public ResponseEntity<ResponseDTO<List<RoomDTO>>> getRoomsByHotel(@PathVariable Long hotelId) {
        return ResponseEntity.ok(hotelService.getRoomsByHotel(hotelId));
    }

    @GetMapping("/hotels/{hotelId}/rooms/available")
    public ResponseEntity<ResponseDTO<List<RoomDTO>>> getAvailableRooms(
            @PathVariable Long hotelId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        return ResponseEntity.ok(hotelService.getAvailableRoomsByHotel(hotelId, checkIn, checkOut));
    }

    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<ResponseDTO<RoomDTO>> getRoomById(@PathVariable Long roomId) {
        return ResponseEntity.ok(hotelService.getRoomById(roomId));
    }

    // ===== ADMIN ENDPOINTS =====

    @PostMapping("/admin/hotels")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO<HotelDTO>> createHotel(@RequestBody HotelDTO dto) {
        log.info("POST /api/admin/hotels - creating hotel: {}", dto.getName());
        return ResponseEntity.ok(hotelService.createHotel(dto));
    }

    @PutMapping("/admin/hotels/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO<HotelDTO>> updateHotel(@PathVariable Long id, @RequestBody HotelDTO dto) {
        return ResponseEntity.ok(hotelService.updateHotel(id, dto));
    }

    @DeleteMapping("/admin/hotels/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO<Void>> deleteHotel(@PathVariable Long id) {
        return ResponseEntity.ok(hotelService.deleteHotel(id));
    }

    @PostMapping("/admin/hotels/{hotelId}/rooms")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO<RoomDTO>> addRoom(@PathVariable Long hotelId, @RequestBody RoomDTO dto) {
        return ResponseEntity.ok(hotelService.addRoom(hotelId, dto));
    }

    @PutMapping("/admin/rooms/{roomId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO<RoomDTO>> updateRoom(@PathVariable Long roomId, @RequestBody RoomDTO dto) {
        return ResponseEntity.ok(hotelService.updateRoom(roomId, dto));
    }

    @DeleteMapping("/admin/rooms/{roomId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO<Void>> deleteRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(hotelService.deleteRoom(roomId));
    }
}
