package com.hotel.hotel_backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoomDTO {
    private Long id;
    private Long hotelId;
    private String hotelName;
    private String hotelLocation;
    private String roomType;
    private BigDecimal pricePerNight;
    private Integer maxOccupancy;
    private boolean availabilityStatus;
    private String description;
    private String imageUrl;
}
