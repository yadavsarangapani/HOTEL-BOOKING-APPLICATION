package com.hotel.hotel_backend.service;

import com.hotel.hotel_backend.entity.Booking;
import com.hotel.hotel_backend.exception.ResourceNotFoundException;
import com.hotel.hotel_backend.repository.BookingRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Value("${stripe.success.url}")
    private String successUrl;

    @Value("${stripe.cancel.url}")
    private String cancelUrl;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EmailService emailService;

    public Map<String, String> createCheckoutSession(Long bookingId) throws StripeException {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found for ID: " + bookingId));

        Stripe.apiKey = stripeSecretKey;

        // Create line item(s) for the booking
        SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("inr")
                                .setUnitAmount(booking.getTotalPrice().multiply(new BigDecimal(100)).longValue()) // Amount in cents
                                .setProductData(
                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                .setName(booking.getRoom().getHotel().getName() + " - " + booking.getRoom().getRoomType())
                                                .setDescription("Booking from " + booking.getCheckInDate() + " to " + booking.getCheckOutDate())
                                                .build()
                                )
                                .build()
                )
                .setQuantity(1L)
                .build();

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(String.format(cancelUrl, booking.getRoom().getHotel().getId()))
                .addLineItem(lineItem)
                .putMetadata("booking_id", String.valueOf(bookingId))
                .build();

        Session session = Session.create(params);
        log.info("Stripe Session created: {} for booking ID: {}", session.getId(), bookingId);

        Map<String, String> response = new HashMap<>();
        response.put("sessionId", session.getId());
        response.put("sessionUrl", session.getUrl());
        return response;
    }

    public Map<String, String> createPaymentIntent(Long bookingId) throws StripeException {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found for ID: " + bookingId));

        Stripe.apiKey = stripeSecretKey;

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(booking.getTotalPrice().multiply(new BigDecimal(100)).longValue())
                .setCurrency("inr")
                .putMetadata("booking_id", String.valueOf(bookingId))
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .build();

        PaymentIntent intent = PaymentIntent.create(params);
        log.info("Payment Intent created: {} for booking ID: {}", intent.getId(), bookingId);

        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", intent.getClientSecret());
        response.put("bookingId", String.valueOf(bookingId));
        response.put("amount", String.valueOf(booking.getTotalPrice()));
        return response;
    }

    public void verifyPayment(String sessionId) throws StripeException {
        Stripe.apiKey = stripeSecretKey;
        Session session = Session.retrieve(sessionId);

        if ("paid".equals(session.getPaymentStatus())) {
            confirmBooking(Long.parseLong(session.getMetadata().get("booking_id")));
        }
    }

    public void confirmBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking != null && !"CONFIRMED".equals(booking.getStatus())) {
            booking.setStatus("CONFIRMED");
            bookingRepository.save(booking);
            log.info("Booking {} marked as CONFIRMED. Sending email...", bookingId);

            // Send Confirmation Email
            emailService.sendBookingConfirmation(
                    booking.getUser().getEmail(),
                    booking.getUser().getName(),
                    booking);
        }
    }
}
