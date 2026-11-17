# Retrievr Ã¢â‚¬â€œ Project Progress

## 2026-11-16 Ã¢â‚¬â€œ Inspection & Implementation (in-progress)

### Environment / baseline
- Project: `V:\LOST AND FOUND` (Spring Boot backend in root, React+Vite frontend in `frontend/`).
- Java: JDK 25.0.2 installed (`java -version`, `javac -version`); Maven 3.9.12. `pom.xml` currently targets Java 17 for compatibility (Java 21 requested but not switched without verified toolchain/build impact).
- MySQL: local service `MySQL84` is **Running**. Existing configured DB: `jdbc:mysql://localhost:3306/lostfound_db` (localhost:3306). Credentials/config externalized to env-backed placeholders in `application.yml` with existing local defaults retained for development; **no credentials printed**.
- Migrations present: `V1__init_schema.sql`Ã¢â‚¬â€œ`V4__seed_data.sql`; added `V5__align_schema_and_indexes.sql` (additive, non-destructive). Flyway enabled with `baseline-on-migrate=true`; `spring.jpa.hibernate.ddl-auto=validate` (dev profile aligned; removed `create-drop`).
- Live DB connectivity/migration application and data state: **not fully verified in this session** (no destructive checks run). `mvn -DskipTests compile` succeeds.

### Backend modules/classes (key)
- **Package refactor:** backend moved to `com.retriever` (user-requested Ã¢â‚¬Å“com.retrieverÃ¢â‚¬Â) with main class `com.retriever.RetrievrApplication` (note: class/file named `RetrieverApplication` in codebase after refactor) and updated `pom.xml` groupId/artifact/start-class. Old `com.college.lostfound` removed.
- **Config:** `SecurityConfig`, `WebConfig` (CORS + `/uploads/**` resource handling), `MatchingProperties` (configurable normalized weights/threshold/candidates), `AsyncConfig`.
- **Entities (inheritance/encapsulation):** `BaseEntity` (`@MappedSuperclass`, audit fields), `User` (abstract, JOINED) Ã¢â€ â€™ `Student`, `Admin`; `Item` (abstract, JOINED) Ã¢â€ â€™ `LostItem`, `FoundItem`; `Category`, `Claim`, `ItemImage`, `ItemMatch`, `Notification` + enums (`ItemStatus`, `ClaimStatus`, `NotificationType`, `Role`-related request enum).
- **DTOs:** auth/item/claim/notification/match/dashboard/profile/error/forgot-password DTOs; request/response/mapper/strategy/validation packages added (`ItemMapper`, `MatchingStrategy`, request/response placeholders).
- **Repositories:** `User/Student/Admin/Item/LostItem/FoundItem/Category/Claim/ItemImage/Notification/ItemMatch` repositories; `ItemRepository` extends `JpaSpecificationExecutor` for search.
- **Services (abstraction):** interfaces `AuthService`, `ItemService`, `MatchService`, `ClaimService`, `NotificationService`, `FileStorageService`, `AdminService`, `CurrentUserService`; implementations in `service.impl` / service package where applicable.
- **Controllers:** `AuthController`, `ItemController`, `ClaimController`, `NotificationController`, `UploadController`, `AdminController`, `DashboardController` (REST, thin-controller intent).
- **Exception/security:** centralized `GlobalExceptionHandler`; JWT filter/service, `SecurityConfig` with RBAC and endpoint rules.

### APIs implemented/updated (current code)
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/forgot-password` (generic response), `GET/PUT /api/auth/profile`.
- Items: `POST /api/items/lost`, `POST /api/items/found`, `GET /api/items` (search/filter/sort/page params incl. keyword/category/location/color/brand/status/sortBy), `GET /api/items/{id}`, `PUT /api/items/{id}`, `DELETE /api/items/{id}`, recent and my-items endpoints, `GET/POST /api/items/{id}/matches`.
- Claims: `POST /api/claims`, `GET /api/claims/my`, `GET /api/claims/item/{itemId}`, `GET /api/claims/pending` (admin), `PUT /api/claims/{id}/approve|reject` (admin).
- Notifications: `GET /api/notifications`, `GET /api/notifications/unread`, `GET /api/notifications/unread/count`, `PUT /api/notifications/{id}/read`.
- Uploads: `POST /api/upload/item/{itemId}` (multipart, ownership check, filesystem + `item_images` metadata).
- Dashboards/Admin: `GET /api/dashboard/user`, `GET /api/dashboard/admin`, `GET /api/admin/stats`, `GET /api/admin/users`, `GET /api/admin/items`, `GET /api/admin/items/lost`, `GET /api/admin/items/found`.

### OOP concepts (implemented in code)
- **Encapsulation:** private entity/DTO fields with Lombok accessors/builders, DTO-based API responses (`ItemMapper`), validation annotations, ownership checks in services/controllers.
- **Inheritance:** `User`Ã¢â€ â€™`Student/Admin` (JOINED), `Item`Ã¢â€ â€™`LostItem/FoundItem` (JOINED), `BaseEntity` superclass for audit fields.
- **Polymorphism:** service interface implementations; item-type behavior via `instanceof`/subclasses in mapping/matching; `MatchService` async + refresh overloads; `MatchingStrategy` interface introduced for extensible scoring (further concrete strategies can be expanded).
- **Abstraction:** repository/service interfaces, `FileStorageService`, matching/notification abstractions behind services.

### Tests / verification
- **Compile:** `mvn -q -DskipTests compile` **PASSED** after refactor/fixes.
- **Automated tests:** existing/required JUnit5/Mockito/MockMvc/integration coverage **not completed/run in this session**.
- **Runtime/API/DB verification:** MySQL connectivity, Flyway application on live DB, endpoint smoke tests, frontend integration, and feature-by-feature validation (uploads, matching persistence/notifications, claim workflows, RBAC edge cases) **pending**.

### Known issues / gaps
- Frontend contract alignment not fully verified end-to-end (some endpoints/shapes may differ from `frontend/src` expectations; item create requires `categoryId` per backend validation while UI flow must supply valid IDs).
- Matching engine implemented with configurable normalized weights and async trigger on create/refresh, but full transactional/event guarantees and candidate performance tuning require runtime validation.
- Image access is served via `/uploads/**` resource handler; finer-grained authorized access and additional hardening (per-request auth checks, content scanning) may be needed.
- Forgot-password is secure generic response only (no mail delivery).
- `docs/OOP_IMPLEMENTATION.md` and `docs/CLASS_DIAGRAM.md` not yet completed to required depth; README needs full setup/run/API/OOP summary update.
- Secrets: env placeholders added; existing local defaults remain in yml for dev convenience and should be replaced with environment-only secrets in non-local use.

### Next steps
1. Verify DB connectivity and apply migrations non-destructively against `lostfound_db`; fix any `validate`/schema mismatches.
2. Run and fix `mvn test`; add required unit/integration/MockMvc tests (auth, items, upload, search, matching, claims, notifications, admin/RBAC).
3. Align remaining frontend API contracts and perform end-to-end integration checks.
4. Complete `docs/OOP_IMPLEMENTATION.md`, `docs/CLASS_DIAGRAM.md` (actual classes/UML), and README; keep progress truthful.
## 2026-11-16 â€“ Backend verification and bug fixing (completed)

### Verification results
- Tests: `mvn -q test` and `mvn test` both completed with BUILD SUCCESS. Note: `src/test` has no test classes currently, so automated coverage is zero and tests did not exercise runtime behavior.
- MySQL connection: local MySQL 8.4 service running; DB `lostfound_db` exists and accessible. Existing data preserved (`users=4`, `items=10`, `categories=7`, `claims=4`, `notifications=7`).
- Flyway: baseline version 4 created for existing schema; V5 (`align schema and indexes`) applied successfully. `uk_claims_item_claimer` unique index present; V5 idempotent logic worked.
- App startup: Spring Boot started successfully on port 8080; Hibernate validation passed; Tomcat ready.
- Auth: registration and login succeeded for a new student (`verify_user@example.com`, id 5). Logout is stateless endpoint. Profile endpoints exist. Admin dashboard correctly returned 403 for student token.
- Items: lost/found creation succeeded (ids 11,12). Search/filter/sort/pagination returned expected results (3 matching). Item update/delete endpoints exist but were not exercised in this run.
- Image upload: multipart upload succeeded (id 1, URL `/uploads/...png`), file stored in `uploads/`, metadata saved in `item_images`.
- Matching: manual refresh returned 3 matches with normalized scores (84.5, 30.67, 30.0) and notifications created.
- Claims: own-item claim rejected with 409; claim on another user's item succeeded (id 5, PENDING). Approve/reject endpoints exist but were not exercised with admin token.
- Notifications: unread count 5 and list 5; mark-as-read endpoint exists but not exercised.
- Dashboards: user dashboard returned myLostItems, myFoundItems, myClaims, potentialMatches, notifications; admin dashboard blocked for student.
- Frontend integration: backend endpoints align with frontend routes (`/api/auth/*`, `/api/items`, `/api/items/{id}/matches`, `/api/claims`, `/api/notifications`, `/api/dashboard/*`, `/api/upload/*`). Full E2E browser verification not performed.

### Bugs fixed
- Flyway MySQL 8.4 incompatibility resolved by adding `flyway-mysql` dependency and enabling baseline-on-migrate with baseline version 4 (existing DB had no Flyway history).
- Malformed `pom.xml` XML (duplicate `</dependency>`) fixed.
- `application-dev.yml` Flyway baseline version aligned to 4.

### Remaining issues
- No automated tests in `src/test`; runtime behavior is unverified by tests.
- User dashboard returns JPA entities (including password hashes) in nested JSON due to direct entity serialization in `AdminServiceImpl#getUserDashboard`; this is a security/data-leak issue and should be fixed with DTO mapping.
- Claim approve/reject and notification mark-as-read not exercised in this verification run.
- Frontend E2E verification with running React app not performed.
- Flyway warns MySQL 8.4 is newer than tested support (8.1).
- Secrets still have development defaults in yml; externalize for non-local use.
## 2026-11-16 – Security hardening and mapper refactoring (completed)

### Security issues discovered
- `AdminServiceImpl#getUserDashboard` serialized nested JPA entities (`myClaims`, `notifications`, `potentialMatches`) directly, exposing password hashes and other sensitive fields (e.g. `password`, `reporter` with full user entity) in JSON responses.
- `application.yml` contained hardcoded development defaults for `DB_PASSWORD` and `JWT_SECRET`.

### Security fixes implemented
- Introduced `ClaimMapper`, `NotificationMapper`, `MatchMapper` (alongside existing `ItemMapper`) to convert all entities to DTOs before API serialization.
- Rewrote `AdminServiceImpl#getUserDashboard` to return DTOs (`ClaimResponse`, `NotificationResponse`, `MatchResponse`, `ItemResponse`) instead of raw JPA entities.
- Updated `ItemServiceImpl`, `ClaimServiceImpl`, `NotificationServiceImpl`, `MatchServiceImpl`, `AdminServiceImpl` to use mapper components and removed old private mapping methods.
- Removed development secret defaults from `application.yml` (`DB_PASSWORD`, `JWT_SECRET` now require environment variables without fallback).
- Verified no password hashes appear in `ItemResponse`, `ClaimResponse`, `NotificationResponse`, `MatchResponse`, `UserProfileResponse`, or `DashboardStats`.

### APIs tested
- Compilation: `mvn -q -DskipTests compile` PASSED (77 source files).
- Tests: `mvn clean test` PASSED (no test classes present; zero automated coverage).
- Manual API verification from previous session: registration, login, item CRUD, image upload, search, matching, claims, notifications, dashboards, RBAC.

### Automated tests created
- None in this session. No test classes exist in `src/test`. Test infrastructure (JUnit 5, Mockito, Spring Boot Test) available via pom dependencies.

### Test results
- `mvn clean test`: BUILD SUCCESS (14.7s). No test classes to execute.
- `mvn -q -DskipTests compile`: PASSED.

### Remaining issues
- No automated tests; runtime behavior unverified by tests.
- Claim approve/reject and notification mark-as-read not exercised with admin token.
- Item update/delete not exercised in this verification run.
- Frontend E2E verification not performed.
- Flyway warns MySQL 8.4 is newer than tested support (8.1).
- Development defaults still present in `application-dev.yml` for local convenience.
## 2026-11-16 � Service tests added
- AuthServiceTest: 8 passing
- ItemServiceTest: 2 passing
- ClaimServiceTest: 9 passing
- NotificationServiceTest: 5 passing
- Total: 24 automated tests, all passing
- mvn clean test: BUILD SUCCESS

## 2026-11-16 � Mapper registration fix
- Added @Component to NotificationMapper and MatchMapper (were missing).
- mvn clean test: BUILD SUCCESS (24 tests).
- mvn spring-boot:run -Dspring-boot.run.profiles=dev: Started successfully on port 8080; Tomcat started; Flyway/Hibernate validation passed; DB connected (dev profile).
- Files modified: NotificationMapper.java, MatchMapper.java, PROJECT_PROGRESS.md.

## 2026-11-16 � Live API verification (partial)
- Registration, login, profile: PASS.
- Invalid token handling: FAIL (500, unhandled MalformedJwtException).
- Startup/DB/Flyway/Hibernate: PASS.
- Full item/claim/notification/dashboard verification: NOT TESTED.
- See API_VERIFICATION_REPORT.md.

## 2026-11-16 � JWT exception handling fix
- JwtAuthenticationFilter now catches JWT parse/validation errors and clears SecurityContext.
- GlobalExceptionHandler returns 401 for unauthenticated AccessDenied.
- Invalid JWT now returns 401 (verified live).
- Files modified: JwtAuthenticationFilter.java, SecurityConfig.java, GlobalExceptionHandler.java.

## 2026-11-16 � Continued live API verification
- Item creation, search, matching, dashboard, notifications: PASS.
- Missing/invalid JWT -> 401: PASS.
- See API_VERIFICATION_REPORT.md.

## 2026-11-16 � Camera capture feature
- Added Take Photo button with mobile capture attribute and desktop getUserMedia modal in ReportItemForm.tsx.
- Frontend build: PASS.
- Mobile camera not tested on device.

## 2026-11-16 � Admin routing fix
- Login now redirects ADMIN users to /admin, others to /dashboard.
- Header Dashboard link is role-aware.
- Frontend build: PASS.

## 2026-11-16 � Complaints foundation
- Added Complaint entity, ComplaintCategory/ComplaintStatus enums, V6 Flyway migration for complaints table.
- mvn clean test: PASS (24 tests).
- Full complaints API/frontend: NOT TESTED (pending implementation).

## 2026-11-16 � IIITA email restriction + ARCHIVED status
- Registration now rejects non-@iiita.ac.in emails (backend).
- ItemStatus.ARCHIVED added for soft-deletion.
- 48-hour scheduling, complaints management, direct recovery: NOT TESTED (pending implementation).
- mvn clean test: PASS (24).

## 2026-11-16 � 48-hour recovery policy foundation
- Added finder_confirmed_at, claimant_confirmed_at, handover_confirmed_at to Claim.
- Added archived_at to Item.
- V7 Flyway migration created.
- Confirmation endpoints, scheduler, complaints management: NOT TESTED (pending).
- mvn clean test: PASS (24).

## 2026-11-16 � Finder claim review
- Added acceptClaimByFinder/rejectClaimByFinder service methods and /api/claims/{id}/accept,/decline endpoints.
- New ClaimStatus values: PENDING_FINDER_REVIEW, ACCEPTED_BY_FINDER, REJECTED_BY_FINDER, etc.
- mvn clean test: PASS (24).

## 2026-11-16 � Finder claim requests frontend
- Added Claim Requests tab to UserDashboard with Accept/Decline buttons wired to /api/claims/{id}/accept,/decline.
- Backend endpoint GET /api/claims/received added.
- Frontend build: PASS; mvn clean test: PASS (24).
