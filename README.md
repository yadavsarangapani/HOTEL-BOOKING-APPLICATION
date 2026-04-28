# 🏨 Hotel Booking Application

A full-stack hotel booking platform built with **Spring Boot**, **React**, and **MySQL** — designed to provide seamless hotel discovery, booking, and management experiences for users, hotel managers, and admins.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#️-tech-stack)
- [Prerequisites](#️-prerequisites)
- [Getting Started](#-getting-started)
  - [Backend Setup](#-backend-setup-spring-boot)
  - [Frontend Setup](#-frontend-setup-react)
  - [Database Setup](#️-database-setup)
- [Key Features](#-key-features)
- [User Roles](#-user-roles)
- [System Architecture](#-system-architecture)
- [Entities](#-entities)
- [Authentication & Authorization](#-authentication--authorization)
- [API Endpoints](#-api-endpoints)
- [API Security](#-api-security)
- [Frontend Structure](#-frontend-structure)
- [Routing](#-routing)
- [API Integration](#-api-integration)
- [Additional Features](#-additional-features)
- [Future Enhancements](#-future-enhancements)

---

## 🚀 Overview

This application enables users to search hotels, book rooms, and manage reservations, while hotel managers can manage hotels, rooms, and view bookings. It follows a **modern RESTful architecture** with secure JWT-based authentication and role-based access control.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, Axios, Responsive UI |
| **Backend** | Spring Boot, Spring Security, JWT, REST APIs |
| **Database** | MySQL |

---

## ⚙️ Prerequisites

- Java 17+
- Node.js 18+
- MySQL Server

---

## 🚀 Getting Started

### 🔧 Backend Setup (Spring Boot)

```bash
# Navigate to backend directory
cd hotel-backend

# Configure database and email settings
# Edit: src/main/resources/application.properties

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

> Server runs at: `http://localhost:8080`

---

### 💻 Frontend Setup (React)

```bash
# Navigate to frontend directory
cd hotel-frontend

# Install dependencies
npm install

# Start the application
npm start
```

> App runs at: `http://localhost:3000`

---

### 🗄️ Database Setup

```sql
CREATE DATABASE hotel_booking;
```

Tables are auto-created via Spring JPA:

```properties
spring.jpa.hibernate.ddl-auto=update
```

---

## ✨ Key Features

- 🔐 JWT Authentication & Authorization
- 🔍 Hotel Search by Location
- 📅 Room Booking & Cancellation
- 📧 Email Notifications
- 📜 Booking History
- 👥 Role-Based Access Control (User / Manager / Admin)
- 📱 Responsive UI

---

## 👥 User Roles

### 👤 User
- Register & Login
- Search hotels by location
- View hotel and room details
- Book & cancel rooms
- View booking history

### 🏨 Hotel Manager
- Manage hotels (Create, Read, Update, Delete)
- Manage rooms (Create, Read, Update, Delete)
- View bookings for their hotels

### 🛡️ Admin
- Manage users, hotels, and bookings
- View system-wide statistics

---

## 🧱 System Architecture

```
Frontend (React)
      ↓
REST API (Spring Boot)
      ↓
Database (MySQL)
```

---

## 🧩 Entities

| Entity | Fields |
|--------|--------|
| **User** | `id`, `name`, `email`, `password`, `role` |
| **Hotel** | `id`, `name`, `location`, `description`, `managerId` |
| **Room** | `id`, `hotelId`, `type`, `price`, `capacity`, `availableRooms` |
| **Booking** | `id`, `userId`, `roomId`, `checkInDate`, `checkOutDate`, `status` |

---

## 🔐 Authentication & Authorization

- JWT-based authentication
- Token stored on the frontend and sent via request headers
- Role-based access control enforced on all protected routes

---

## 🔌 API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |

### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/hotels` | List all hotels |
| `GET` | `/api/hotels/{id}` | Get hotel details |
| `POST` | `/api/bookings` | Create a booking |
| `GET` | `/api/bookings/my` | Get user's bookings |
| `DELETE` | `/api/bookings/{id}` | Cancel a booking |

### Manager

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/hotels` | Create a hotel |
| `PUT` | `/api/hotels/{id}` | Update a hotel |
| `DELETE` | `/api/hotels/{id}` | Delete a hotel |
| `POST` | `/api/rooms` | Add a room |
| `PUT` | `/api/rooms/{id}` | Update a room |
| `DELETE` | `/api/rooms/{id}` | Delete a room |
| `GET` | `/api/bookings/hotel/{id}` | View hotel bookings |

### Admin

- Full access to manage users, hotels, bookings, and system statistics

---

## 🔒 API Security

| Access Level | Endpoints |
|-------------|-----------|
| **Public** | `/api/auth/**`, `GET /api/hotels` |
| **USER** | `/api/bookings/**` |
| **MANAGER** | `/api/rooms/**`, Hotel modifications |
| **ADMIN** | All endpoints |

---

## 🎨 Frontend Structure

```
src/
├── components/    # Reusable UI components
├── pages/         # Page-level views
├── services/      # Axios API calls
├── context/       # Global state (Auth context)
└── routes/        # Route definitions
```

---

## 🔁 Routing

- **Public routes** — accessible to all visitors
- **Protected routes** — restricted by user role
- Unauthorized access is automatically redirected to the login page

---

## 🔗 API Integration

```javascript
// Axios with JWT Authorization header
Authorization: Bearer <token>
```

- Axios handles all API communication
- JWT token is stored in `localStorage`
- Token is attached to every protected request via headers

---

## 📧 Additional Features

- **Email Notifications** — sent on registration, booking, and cancellation
- **Forgot Password** — password reset via email link
- **Activity Logging** — tracks user and system actions for debugging

---

## 🔄 Workflow

```
Authentication → Hotel Search → Room Selection → Booking → Admin Management
```

---

## 📌 Future Enhancements

- [ ] Payment Gateway Integration
- [ ] Advanced Search Filters
- [ ] Ratings & Reviews
- [ ] Real-time Room Availability

---

## 📄 License

This project is for educational and demonstration purposes for hackathon.