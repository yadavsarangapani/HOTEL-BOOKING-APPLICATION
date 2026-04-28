# Hotel Booking Application

A full-stack hotel booking platform built with Spring Boot, React, and MySQL.

## Prerequisites
- Java 17 or higher
- Node.js 18 or higher (with npm)
- MySQL Server

## Backend Setup (Spring Boot)
1. Navigate to `hotel-backend`.
2. Update `src/main/resources/application.properties` with your MySQL credentials and Email (SMTP) details.
3. Run `mvn clean install` to build the application.
4. Run `mvn spring-boot:run` to start the server on `http://localhost:8080`.

## Frontend Setup (React)
1. Navigate to `hotel-frontend`.
2. Run `npm install` to install dependencies.
3. Run `npm start` to start the development server on `http://localhost:3000`.

## Database Setup
1. Create a MySQL database named `hotel_booking`.
2. The application will automatically create the tables on the first run (`spring.jpa.hibernate.ddl-auto=update`).

## Features
- User Auth (JWT)
- Hotel Search by Location
- Room Booking & Cancellation
- Email Notifications
- Responsive Design
