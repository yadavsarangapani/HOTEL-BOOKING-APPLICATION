package com.hotel.hotel_backend.service;

import com.hotel.hotel_backend.dto.*;
import com.hotel.hotel_backend.entity.PasswordResetToken;
import com.hotel.hotel_backend.entity.Role;
import com.hotel.hotel_backend.entity.User;
import com.hotel.hotel_backend.exception.OurException;
import com.hotel.hotel_backend.exception.ResourceNotFoundException;
import com.hotel.hotel_backend.repository.PasswordResetTokenRepository;
import com.hotel.hotel_backend.repository.UserRepository;
import com.hotel.hotel_backend.util.JWTUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JWTUtils jwtUtils;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private EmailService emailService;
    @Autowired private PasswordResetTokenRepository tokenRepository;

    public ResponseDTO<UserDTO> register(SignupRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new OurException("Email already in use: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.USER)
                .active(true)
                .build();

        User saved = userRepository.save(user);
        log.info("User registered successfully with id: {}", saved.getId());

        emailService.sendRegistrationConfirmation(saved.getEmail(), saved.getName());

        return ResponseDTO.success("Registration successful", toDTO(saved));
    }

    public ResponseDTO<UserDTO> login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<String, Object> claims = Map.of("role", user.getRole().name(), "userId", user.getId());
        String token = jwtUtils.generateToken(user, claims);

        log.info("User logged in successfully: {}", request.getEmail());

        ResponseDTO<UserDTO> response = ResponseDTO.<UserDTO>builder()
                .success(true)
                .message("Login successful")
                .token(token)
                .role(user.getRole().name())
                .data(toDTO(user))
                .build();

        return response;
    }

    public ResponseDTO<UserDTO> getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return ResponseDTO.success("User fetched", toDTO(user));
    }

    public ResponseDTO<UserDTO> getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseDTO.success("User fetched", toDTO(user));
    }

    public ResponseDTO<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userRepository.findAll()
                .stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseDTO.success("Users fetched", users);
    }

    public ResponseDTO<Void> forgotPassword(String email) {
        log.info("Forgot password request for email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Delete existing token if any
        tokenRepository.findByUser(user).ifPresent(tokenRepository::delete);

        String tokenValue = UUID.randomUUID().toString();
        PasswordResetToken token = PasswordResetToken.builder()
                .token(tokenValue)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .build();

        tokenRepository.save(token);
        emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), tokenValue);

        return ResponseDTO.success("Password reset link sent to your email.");
    }

    public ResponseDTO<Void> resetPassword(String tokenValue, String newPassword) {
        log.info("Resetting password using token");
        PasswordResetToken token = tokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new OurException("Invalid or expired reset link."));

        if (token.isExpired()) {
            tokenRepository.delete(token);
            throw new OurException("Reset link has expired. Please request a new one.");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(token);
        log.info("Password reset successful for user: {}", user.getEmail());

        return ResponseDTO.success("Password has been reset successfully. You can now login.");
    }

    public ResponseDTO<Void> deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
        log.info("User deleted: {}", id);
        return ResponseDTO.success("User deleted successfully");
    }

    public UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
