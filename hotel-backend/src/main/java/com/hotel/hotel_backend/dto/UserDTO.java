package com.hotel.hotel_backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private boolean active;
    private LocalDateTime createdAt;
}
