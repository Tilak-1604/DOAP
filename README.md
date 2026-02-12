# 📢 DOAP – Digital Outdoor Advertising Platform

A full-stack web platform that enables advertisers to book digital outdoor advertising screens across a city in an automated and intelligent way.

---

## 🚀 Project Overview

DOAP (Digital Outdoor Advertising Platform) connects:

- 🟢 **Advertisers** who want to run advertisements  
- 🔵 **Screen Owners** who own digital display screens  
- 🟣 **Admin** who manages and governs the platform  

The system provides structured screen discovery, AI-based recommendations, slot-based booking, dynamic pricing, secure content upload, and event-driven notifications.

---

## 🎯 Problem Statement

Outdoor digital advertising is often:

- Manual and unorganized  
- Difficult to monitor  
- Price inconsistent  
- Hard to scale  

DOAP solves this by providing:

- Centralized screen management  
- Automated booking and billing  
- Intelligent recommendations  
- Transparent usage tracking  

---

# 👥 User Roles

## 🟢 Advertiser
- Discover active screens
- Get AI-based screen recommendations
- Upload advertisement content
- Select date and time slot
- Book screens
- View booking history
- Receive email notifications

---

## 🔵 Screen Owner
- Add and manage personal screens
- View screen status
- Track bookings on owned screens
- View earnings summary
- Mark screen under maintenance

---

## 🟣 Admin
- Approve or reject screens
- Manage pricing rules
- Monitor all bookings
- Moderate advertisement content
- Override screen status

---

# 🧠 Core Features

## 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Advertiser / Screen Owner / Admin)
- Secure password encryption

---

## 🖥 Screen Management
- Admin and Screen Owner can add screens
- Approval workflow for owner-added screens
- Screen status lifecycle:
  - `PENDING`
  - `ACTIVE`
  - `UNDER_MAINTENANCE`
  - `INACTIVE`
  - `REJECTED`

---

## 📍 Location Handling
- PIN-code-based location management
- Standardized geographic grouping

---

## 📅 Slot-Based Booking System
- Fixed time slots
- Conflict-free booking (no overlapping)
- Booking lifecycle:
  - `PENDING`
  - `CONFIRMED`
  - `COMPLETED`
  - `CANCELLED`

---

## 💰 Dynamic Pricing Engine

Pricing is calculated dynamically at booking time:

- Pricing controlled by Admin
- Screen owners do NOT set prices
- Final price is locked at booking confirmation

---

## 🤖 AI-Based Recommendation (Rule-Based)

The system recommends screens based on:

- Business type
- Location relevance
- Budget range
- Screen category
- Availability

---

## 🛡 Content Validation
- File type validation
- File size limit enforcement
- Video duration check
- Secure storage using AWS S3

---

## 📧 Event-Based Email Notifications

Notifications are sent when:

- Booking is confirmed or cancelled
- Advertisement is approved or rejected
- Screen is approved or rejected
- Booking is received (Screen Owner)

Emails are triggered only after successful state changes.

---

# 🏗 System Architecture

### Frontend
- React
- Role-based routing
- Dashboard-based UI

### Backend
- Spring Boot
- Spring Security (JWT)
- REST APIs
- JPA / Hibernate

### Database
- MySQL

### Cloud Storage
- AWS S3 (for advertisement media)

### Notification Service
- SMTP Email Integration

---

# 🗄 Database Design (Core Tables)

- `users`
- `roles`
- `user_roles`
- `screens`
- `bookings`
- `booking_screens`
- `payments`
- `advertisements`
- `pricing_rules`

---

# 🔄 Complete Advertiser Flow

1. Login  
2. Discover screens  
3. Get AI recommendation  
4. Select screen  
5. Select date and time slot  
6. Select uploaded advertisement  
7. Dynamic price calculated  
8. Booking confirmed  
9. Email notification sent  

---

# 🖥 Dashboards

## Advertiser Dashboard
- Active bookings
- Completed bookings
- Total spend
- Uploaded ads
- Create booking

## Screen Owner Dashboard
- My screens
- Booking history per screen
- Earnings summary
- Maintenance toggle

## Admin Dashboard
- Screen approvals
- Booking monitoring
- Pricing rule configuration
- Content moderation

---

# ⚙ Installation & Setup

## Backend Setup

```bash
git clone <repository-url>
cd backend

---

If you want next, I can give you:

- 🔥 A **short professional GitHub description (one paragraph)**
- 🎯 A **LinkedIn-ready project summary**
- 🎤 A **final viva explanation script**
- 🧾 A **submission checklist**

Just tell me what you need 👍


