package com.hotel.hotel_backend.repository;

import com.hotel.hotel_backend.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    @Query("SELECT h FROM Hotel h WHERE LOWER(h.location) LIKE LOWER(CONCAT('%', :location, '%'))")
    List<Hotel> findByLocationContainingIgnoreCase(@Param("location") String location);

    @Query("SELECT h FROM Hotel h WHERE LOWER(h.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Hotel> findByNameContainingIgnoreCase(@Param("name") String name);

    @Query("SELECT h FROM Hotel h WHERE h.rating >= :minRating")
    List<Hotel> findByRatingGreaterThanEqual(@Param("minRating") Double minRating);

    @Query("SELECT DISTINCT h.location FROM Hotel h ORDER BY h.location")
    List<String> findAllDistinctLocations();
}
