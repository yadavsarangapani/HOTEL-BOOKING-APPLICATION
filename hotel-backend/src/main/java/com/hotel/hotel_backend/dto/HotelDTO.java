package com.hotel.hotel_backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class HotelDTO {
    private Long id;
    private String name;
    private String location;
    private String description;
    private Double rating;
    private String amenities;
    private String imageUrl;
    private LocalDateTime createdAt;
    private List<RoomDTO> rooms;
}
