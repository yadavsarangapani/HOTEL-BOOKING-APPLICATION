package com.hotel.hotel_backend.repository;

import com.hotel.hotel_backend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByHotelId(Long hotelId);

    List<Room> findByHotelIdAndAvailabilityStatusTrue(Long hotelId);

    @Query("""
        SELECT r FROM Room r WHERE r.hotel.id = :hotelId
        AND r.availabilityStatus = true
        AND r.id NOT IN (
            SELECT b.room.id FROM Booking b
            WHERE b.status != 'CANCELLED'
            AND (b.checkInDate < :checkOut AND b.checkOutDate > :checkIn)
        )
    """)
    List<Room> findAvailableRooms(
            @Param("hotelId") Long hotelId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut);

    @Query("""
        SELECT r FROM Room r WHERE r.availabilityStatus = true
        AND r.id NOT IN (
            SELECT b.room.id FROM Booking b
            WHERE b.status != 'CANCELLED'
            AND (b.checkInDate < :checkOut AND b.checkOutDate > :checkIn)
        )
        AND LOWER(r.hotel.location) LIKE LOWER(CONCAT('%', :location, '%'))
    """)
    List<Room> findAvailableRoomsByLocation(
            @Param("location") String location,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut);
}
