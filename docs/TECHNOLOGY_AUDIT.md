# Retrievr Technology Audit

## Executive Summary
Retrievr is a full-stack Lost & Found platform: Java 17 + Spring Boot 3.3.5 backend, React 18 + Vite frontend, MySQL 8.4 database. Backend business logic is exclusively Java. Frontend uses TypeScript/TSX + CSS. SQL migrations via Flyway.

## Folder Structure
- backend/ - Spring Boot (pom.xml, src/main, src/test)
- frontend/ - React+Vite (package.json, src/)
- docs/ - markdown docs
- uploads/ - runtime user images (gitignored)
- logo/ - branding

## Languages Used
| Language | Files | Component | Purpose |
|---|---|---|---|
| Java | 84 | Backend | Business logic, REST APIs, security |
| TypeScript/TSX | 29 | Frontend | UI components, routing |
| SQL | 7 | Database | Flyway migrations |
| YAML | 2 | Config | application.yml, application-dev.yml |
| HTML | 1 | Frontend | index.html |
| CSS | 2 | Frontend | index.css, tailwind |
| JSON | 2 | Config | package.json, tsconfig |

## Backend
- Java 17, Spring Boot 3.3.5, Maven
- Entry: com.retriever.RetrieverApplication
- 7 controllers, service interfaces+impls, 11 JPA repos, entities, DTOs, mappers
- Security: Spring Security + JWT (JwtService, JwtAuthenticationFilter)
- Flyway migrations V1-V7
- Tests: JUnit 5 + Mockito (24 tests)

## Frontend
- React 18.2, Vite, react-router-dom 6.30, axios, framer-motion, lucide-react, Tailwind
- TypeScript/TSX components and pages

## Database
- MySQL 8.4, JPA/Hibernate, Flyway
- Operations via Java JPA + SQL migrations

## GitHub Language Stats Explanation
Java shows only ~2.9% because frontend (JS/TS/HTML/CSS) files outnumber and are larger in line count; .agents/.claude skills also contribute JS. Backend Java is present (84 files). Percentages reflect file volume, not architectural importance.

## Is backend exclusively Java?
Yes. All backend business logic is Java. No Python/JS on backend. Frontend: TS/TSX/JS/CSS/HTML. Database: SQL migrations + Java JPA. Supporting tools: YAML/JSON/XML/Markdown.
