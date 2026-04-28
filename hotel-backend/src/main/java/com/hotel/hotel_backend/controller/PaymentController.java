package com.hotel.hotel_backend.controller;

import com.hotel.hotel_backend.dto.ResponseDTO;
import com.hotel.hotel_backend.service.PaymentService;
import com.stripe.exception.StripeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/checkout/{bookingId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO<Map<String, String>>> createCheckoutSession(@PathVariable Long bookingId) {
        log.info("POST /api/payments/checkout/{}", bookingId);
        try {
            Map<String, String> response = paymentService.createCheckoutSession(bookingId);
            return ResponseEntity.ok(ResponseDTO.success("Checkout session created", response));
        } catch (StripeException e) {
            log.error("Stripe error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseDTO.error("Stripe payment error: " + e.getMessage()));
        }
    }

    @PostMapping("/create-intent/{bookingId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO<Map<String, String>>> createPaymentIntent(@PathVariable Long bookingId) {
        log.info("POST /api/payments/create-intent/{}", bookingId);
        try {
            Map<String, String> response = paymentService.createPaymentIntent(bookingId);
            return ResponseEntity.ok(ResponseDTO.success("Payment intent created", response));
        } catch (StripeException e) {
            log.error("Stripe error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseDTO.error("Stripe payment error: " + e.getMessage()));
        }
    }

    @PostMapping("/confirm/{bookingId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO<Void>> confirmPayment(@PathVariable Long bookingId) {
        log.info("POST /api/payments/confirm/{}", bookingId);
        paymentService.confirmBooking(bookingId);
        return ResponseEntity.ok(ResponseDTO.success("Booking confirmed successfully."));
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO<Void>> verifyPayment(@RequestBody Map<String, String> request) {
        String sessionId = request.get("sessionId");
        log.info("POST /api/payments/verify/{}", sessionId);
        try {
            paymentService.verifyPayment(sessionId);
            return ResponseEntity.ok(ResponseDTO.success("Payment verified and booking updated."));
        } catch (StripeException e) {
            log.error("Stripe error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseDTO.error("Payment verification failed."));
        }
    }
}
