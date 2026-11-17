# Retrievr – Smart Lost & Found Platform

A professional, full-stack Lost & Found web application inspired by Amazon/Flipkart UX.
Helps people report lost belongings, discover found items, and reconnect with their rightful owners.

## Features
- User registration, login, logout (JWT + BCrypt)
- Report Lost Item / Report Found Item with image upload
- Smart Java-based matching between lost and found items
- Powerful search and filtering (category, location, date, color, brand, status, sort)
- Claim item flow with admin approval/rejection
- User dashboard (my items, claims, matches, notifications)
- Admin dashboard (statistics, manage users/items/claims)
- Responsive e-commerce-style UI

## Technology Stack
- **Frontend:** React.js + TypeScript + Vite + Tailwind CSS + Framer Motion + Lucide icons
- **Backend:** Java 17, Spring Boot, Spring MVC, Spring Security, Spring Data JPA, Hibernate, Maven
- **Database:** MySQL
- **Security:** JWT authentication, BCrypt password hashing, role-based authorization

## Project Structure
```
backend/                  # Spring Boot Maven project
  src/main/java/com/college/lostfound/
    config/
    controller/
    service/ + service/impl/
    repository/
    entity/
    dto/
    security/
    exception/
    util/
  src/main/resources/
    application.yml
    application-dev.yml
    db/migration/   # Flyway
frontend/                 # React + TypeScript + Vite
  src/
    components/
    pages/
    services/
    context/
    assets/
```

## Prerequisites
- Java 17 or later
- Maven 3.8+
- MySQL 8.0+ (running locally)
- Node.js 18+ and npm/yarn/pnpm

## Setup Instructions

### 1. Database Setup
MySQL is running locally. Create the database:
```sql
CREATE DATABASE lostfound_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
Credentials are configured in `backend/src/main/resources/application.yml`:
```
spring.datasource.username=root
spring.datasource.password=90057
```

### 2. Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
The backend starts at `http://localhost:8080`.

Swagger UI: `http://localhost:8080/swagger-ui.html`
API Docs: `http://localhost:8080/api-docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend starts at `http://localhost:5173` (Vite dev server).

### 4. Environment Configuration
Create `frontend/.env.local` if needed:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| POST | /api/items | Report lost/found item |
| GET | /api/items | List items (search/filter) |
| GET | /api/items/{id} | Get item detail |
| POST | /api/items/{id}/images | Upload item images |
| POST | /api/items/{id}/matches | Trigger manual match |
| POST | /api/claims | Submit claim request |
| GET | /api/claims/my | My claims |
| PUT | /api/claims/{id}/approve | Approve claim (admin) |
| PUT | /api/claims/{id}/reject | Reject claim (admin) |
| GET | /api/notifications | My notifications |
| GET | /api/admin/stats | Dashboard statistics (admin) |
| GET | /api/admin/users | Manage users (admin) |
| GET | /api/admin/items | Manage items (admin) |
| GET | /api/admin/claims | Manage claims (admin) |

## Default Admin Account
Register via the UI or seed data. Default admin credentials are seeded by Flyway migration V4.

## Testing
Backend tests can be run with:
```bash
cd backend
mvn test
```

## Documentation
- OOP Implementation: `docs/OOP_EXPLANATION.md`
- REST API: Swagger UI at `/swagger-ui.html`
- Project Progress: `PROJECT_PROGRESS.md`

## License
Academic project.