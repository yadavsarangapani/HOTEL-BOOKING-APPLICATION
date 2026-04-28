package com.hotel.hotel_backend.util;

import com.hotel.hotel_backend.entity.Hotel;
import com.hotel.hotel_backend.entity.Room;
import com.hotel.hotel_backend.entity.User;
import com.hotel.hotel_backend.entity.Role;
import com.hotel.hotel_backend.repository.HotelRepository;
import com.hotel.hotel_backend.repository.RoomRepository;
import com.hotel.hotel_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Random;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        if (hotelRepository.count() == 0) {
            seedHotels();
        }
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@hotel.com")) {
            User admin = User.builder()
                    .name("Admin Manager")
                    .email("admin@hotel.com")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("1234567890")
                    .role(Role.ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
            System.out.println("Successfully seeded admin user: admin@hotel.com");
        } else {
            User admin = userRepository.findByEmail("admin@hotel.com").get();
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Synchronized admin password: admin123");
        }

        if (!userRepository.existsByEmail("user@hotel.com")) {
            User user = User.builder()
                    .name("John Doe")
                    .email("user@hotel.com")
                    .password(passwordEncoder.encode("user123"))
                    .phone("9876543210")
                    .role(Role.USER)
                    .active(true)
                    .build();
            userRepository.save(user);
            System.out.println("Successfully seeded test user: user@hotel.com");
        } else {
            User user = userRepository.findByEmail("user@hotel.com").get();
            user.setPassword(passwordEncoder.encode("user123"));
            userRepository.save(user);
            System.out.println("Synchronized test user password: user123");
        }
    }

    private void seedHotels() {
        String[] cities = {
            "Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Ooty", "Kodaikanal", 
            "Vellore", "Erode", "Tirunelveli", "Kanyakumari", "Thanjavur", "Tuticorin", 
            "Dindigul", "Hosur", "Kumbakonam", "Nagapattinam", "Namakkal", "Pudukkottai", "Sivakasi"
        };

        String[] hotelNames = {
            "LuxStay", "Royal Heritage", "Marine Bay", "Green Valley", "Skyline View", 
            "The Majestic", "Ocean Pearl", "Gardenia Inn", "Serenity Suites", "Hilltop Resort"
        };

        Random random = new Random();

        for (int i = 1; i <= 50; i++) {
            String city = cities[random.nextInt(cities.length)];
            String name = city + " " + hotelNames[random.nextInt(hotelNames.length)] + " " + i;
            
            Hotel hotel = Hotel.builder()
                    .name(name)
                    .location(city)
                    .description("A premium stay experience in " + city + ". Enjoy world-class amenities and exceptional service.")
                    .rating(3.5 + (random.nextDouble() * 1.5))
                    .amenities("Free Wifi, Swimming Pool, Gym, Restaurant, Spa, Car Parking")
                    .imageUrl(getRandomHotelImage(random))
                    .build();

            hotel = hotelRepository.save(hotel);

            // Add 2-3 rooms for each hotel
            int numRooms = 2 + random.nextInt(2);
            for (int k = 1; k <= numRooms; k++) {
                Room room = Room.builder()
                        .hotel(hotel)
                        .roomType(k % 2 == 0 ? "Deluxe Room" : "Executive Suite")
                        .pricePerNight(BigDecimal.valueOf(500 + random.nextInt(1501))) // Range 500 - 2000
                        .maxOccupancy(2 + random.nextInt(3))
                        .availabilityStatus(true)
                        .description("Spacious " + (k % 2 == 0 ? "Deluxe Room" : "Executive Suite") + " with modern decor and essential amenities.")
                        .imageUrl(getRandomRoomImage(random))
                        .build();
                roomRepository.save(room);
            }
        }
        System.out.println("Successfully seeded 50 hotels in Tamilnadu.");
    }

    private String getRandomHotelImage(Random random) {
        String[] images = {
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
            "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80"
        };
        return images[random.nextInt(images.length)];
    }

    private String getRandomRoomImage(Random random) {
        String[] images = {
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80"
        };
        return images[random.nextInt(images.length)];
    }
}
