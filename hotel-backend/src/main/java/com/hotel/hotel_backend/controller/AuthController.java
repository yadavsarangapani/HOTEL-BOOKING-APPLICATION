package com.hotel.hotel_backend.controller;

import com.hotel.hotel_backend.dto.*;
import com.hotel.hotel_backend.service.UserService;
import jakarta.validation.Valid;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ResponseDTO<UserDTO>> register(@Valid @RequestBody SignupRequest request) {
        log.info("POST /api/auth/register - email: {}", request.getEmail());
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseDTO<UserDTO>> login(@Valid @RequestBody LoginRequest request) {
        log.info("POST /api/auth/login - email: {}", request.getEmail());
        return ResponseEntity.ok(userService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ResponseDTO<Void>> forgotPassword(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(userService.forgotPassword(request.get("email")));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ResponseDTO<Void>> resetPassword(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(userService.resetPassword(request.get("token"), request.get("newPassword")));
    }
}
