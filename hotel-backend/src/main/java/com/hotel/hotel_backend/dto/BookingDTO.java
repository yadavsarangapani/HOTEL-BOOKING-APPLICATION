package com.hotel.hotel_backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingDTO {
    private Long id;
    private Long roomId;
    private Long hotelId;
    private String hotelName;
    private String hotelLocation;
    private String roomType;
    private String roomImageUrl;
    private Long userId;
    private String userName;
    private String userEmail;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private BigDecimal totalPrice;
    private String status;
    private Integer numGuests;
    private String specialRequests;
    private LocalDateTime createdAt;
}
