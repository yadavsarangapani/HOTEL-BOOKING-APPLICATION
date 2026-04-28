package com.hotel.hotel_backend.service;

import com.hotel.hotel_backend.dto.HotelDTO;
import com.hotel.hotel_backend.dto.ResponseDTO;
import com.hotel.hotel_backend.dto.RoomDTO;
import com.hotel.hotel_backend.entity.Hotel;
import com.hotel.hotel_backend.entity.Room;
import com.hotel.hotel_backend.exception.ResourceNotFoundException;
import com.hotel.hotel_backend.repository.HotelRepository;
import com.hotel.hotel_backend.repository.RoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HotelService {

    private static final Logger log = LoggerFactory.getLogger(HotelService.class);

    @Autowired private HotelRepository hotelRepository;
    @Autowired private RoomRepository roomRepository;

    public ResponseDTO<List<HotelDTO>> getAllHotels() {
        List<HotelDTO> hotels = hotelRepository.findAll()
                .stream().map(this::toDTOBasic).collect(Collectors.toList());
        log.info("Fetched {} hotels", hotels.size());
        return ResponseDTO.success("Hotels fetched", hotels);
    }

    public ResponseDTO<HotelDTO> getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
        return ResponseDTO.success("Hotel fetched", toDTOWithRooms(hotel));
    }

    public ResponseDTO<List<HotelDTO>> searchByLocation(String location) {
        List<HotelDTO> hotels = hotelRepository.findByLocationContainingIgnoreCase(location)
                .stream().map(this::toDTOBasic).collect(Collectors.toList());
        log.info("Found {} hotels in location: {}", hotels.size(), location);
        return ResponseDTO.success("Hotels fetched", hotels);
    }

    public ResponseDTO<List<RoomDTO>> searchAvailableRooms(String location, LocalDate checkIn, LocalDate checkOut) {
        if (checkIn.isAfter(checkOut) || checkIn.isEqual(checkOut)) {
            throw new IllegalArgumentException("Check-in must be before check-out date");
        }
        List<RoomDTO> rooms = roomRepository.findAvailableRoomsByLocation(location, checkIn, checkOut)
                .stream().map(this::roomToDTO).collect(Collectors.toList());
        log.info("Found {} available rooms in {} from {} to {}", rooms.size(), location, checkIn, checkOut);
        return ResponseDTO.success("Available rooms fetched", rooms);
    }

    public ResponseDTO<List<RoomDTO>> getRoomsByHotel(Long hotelId) {
        List<RoomDTO> rooms = roomRepository.findByHotelId(hotelId)
                .stream().map(this::roomToDTO).collect(Collectors.toList());
        return ResponseDTO.success("Rooms fetched", rooms);
    }

    public ResponseDTO<List<RoomDTO>> getAvailableRoomsByHotel(Long hotelId, LocalDate checkIn, LocalDate checkOut) {
        List<RoomDTO> rooms = roomRepository.findAvailableRooms(hotelId, checkIn, checkOut)
                .stream().map(this::roomToDTO).collect(Collectors.toList());
        return ResponseDTO.success("Available rooms fetched", rooms);
    }

    public ResponseDTO<RoomDTO> getRoomById(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));
        return ResponseDTO.success("Room fetched", roomToDTO(room));
    }

    public ResponseDTO<List<String>> getAllLocations() {
        return ResponseDTO.success("Locations fetched", hotelRepository.findAllDistinctLocations());
    }

    // Admin
    public ResponseDTO<HotelDTO> createHotel(HotelDTO dto) {
        Hotel hotel = Hotel.builder()
                .name(dto.getName()).location(dto.getLocation())
                .description(dto.getDescription()).rating(dto.getRating())
                .amenities(dto.getAmenities()).imageUrl(dto.getImageUrl())
                .build();
        Hotel saved = hotelRepository.save(hotel);
        log.info("Hotel created: {}", saved.getId());
        return ResponseDTO.success("Hotel created", toDTOBasic(saved));
    }

    public ResponseDTO<HotelDTO> updateHotel(Long id, HotelDTO dto) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found"));
        hotel.setName(dto.getName());
        hotel.setLocation(dto.getLocation());
        hotel.setDescription(dto.getDescription());
        hotel.setRating(dto.getRating());
        hotel.setAmenities(dto.getAmenities());
        hotel.setImageUrl(dto.getImageUrl());
        return ResponseDTO.success("Hotel updated", toDTOBasic(hotelRepository.save(hotel)));
    }

    public ResponseDTO<Void> deleteHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found"));
        hotelRepository.delete(hotel);
        log.info("Hotel deleted: {}", id);
        return ResponseDTO.success("Hotel deleted");
    }

    public ResponseDTO<RoomDTO> addRoom(Long hotelId, RoomDTO dto) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found"));
        Room room = Room.builder()
                .hotel(hotel).roomType(dto.getRoomType())
                .pricePerNight(dto.getPricePerNight()).maxOccupancy(dto.getMaxOccupancy())
                .availabilityStatus(true).description(dto.getDescription())
                .imageUrl(dto.getImageUrl())
                .build();
        return ResponseDTO.success("Room added", roomToDTO(roomRepository.save(room)));
    }

    public ResponseDTO<RoomDTO> updateRoom(Long roomId, RoomDTO dto) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        room.setRoomType(dto.getRoomType());
        room.setPricePerNight(dto.getPricePerNight());
        room.setMaxOccupancy(dto.getMaxOccupancy());
        room.setDescription(dto.getDescription());
        room.setImageUrl(dto.getImageUrl());
        room.setAvailabilityStatus(dto.isAvailabilityStatus());
        return ResponseDTO.success("Room updated", roomToDTO(roomRepository.save(room)));
    }

    public ResponseDTO<Void> deleteRoom(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        roomRepository.delete(room);
        log.info("Room deleted: {}", roomId);
        return ResponseDTO.success("Room deleted");
    }

    private HotelDTO toDTOBasic(Hotel h) {
        return HotelDTO.builder()
                .id(h.getId()).name(h.getName()).location(h.getLocation())
                .description(h.getDescription()).rating(h.getRating())
                .amenities(h.getAmenities()).imageUrl(h.getImageUrl())
                .createdAt(h.getCreatedAt()).build();
    }

    private HotelDTO toDTOWithRooms(Hotel h) {
        HotelDTO dto = toDTOBasic(h);
        if (h.getRooms() != null) {
            dto.setRooms(h.getRooms().stream().map(this::roomToDTO).collect(Collectors.toList()));
        }
        return dto;
    }

    public RoomDTO roomToDTO(Room r) {
        return RoomDTO.builder()
                .id(r.getId()).hotelId(r.getHotel().getId())
                .hotelName(r.getHotel().getName()).hotelLocation(r.getHotel().getLocation())
                .roomType(r.getRoomType()).pricePerNight(r.getPricePerNight())
                .maxOccupancy(r.getMaxOccupancy()).availabilityStatus(r.isAvailabilityStatus())
                .description(r.getDescription()).imageUrl(r.getImageUrl())
                .build();
    }
}