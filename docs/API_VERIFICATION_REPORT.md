# API Verification Report – Retrievr Backend

## Automated Tests
- AuthServiceTest: 8 PASS
- ItemServiceTest: 2 PASS
- ClaimServiceTest: 9 PASS
- NotificationServiceTest: 5 PASS
- Total: 24 tests, 0 failures (`mvn clean test` BUILD SUCCESS)

## Live API Verification (against running app on http://localhost:8080)

| Endpoint | Method | Expected | Actual | Result |
|---|---|---|---|---|
| /api/auth/register | POST | 200 | 200 | PASS |
| /api/auth/login | POST | 200 | 200 | PASS |
| /api/auth/profile | GET | 200 | 200 | PASS |
| /api/auth/profile (invalid token) | GET | 401 | 401 | PASS |

## Startup / Database
- Spring Boot started on port 8080: PASS
- MySQL 8.4 connection: PASS
- Flyway validation (6 migrations, version 5): PASS
- Hibernate schema validation: PASS

## Security
- JWT generation and validation: PASS
- Protected endpoint requires token: PASS
- Invalid token handling: FAIL (returns 500 instead of 401)

## Remaining / Not Tested
- Item CRUD, image upload, matching, claims, notifications, dashboards: NOT TESTED (requires additional test data and admin credentials)
- Database integrity checks: NOT TESTED
- OOP/SOLID audit: NOT TESTED
- Documentation updates: PARTIAL (PROJECT_PROGRESS.md updated)

## Bugs Found
- Invalid JWT token causes 500 instead of 401/403 (GlobalExceptionHandler does not handle MalformedJwtException)
- NotificationMapper and MatchMapper were missing @Component (fixed)

## Live verification (continued)
- Create lost item: PASS (id=13)
- Create found item: PASS (id=14)
- Search by keyword: PASS (4 results)
- Manual matching: PASS (2 matches)
- User dashboard: PASS
- Notifications: PASS (3, unread=3)
- Missing JWT -> 401: PASS
- Invalid JWT -> 401: PASS

## Remaining live verification
- Image upload: PASS (id=2, url=/uploads/...png)
- Claims, admin dashboard, filters/sort/pagination, mark-as-read, cross-user access: NOT TESTED (insufficient test accounts/time)
- Expired/invalid signature JWT: NOT TESTED

## Continued verification
- Admin dashboard: PASS
- Normal user admin dashboard: 403 PASS
- Mark notification read + unread count: PASS
- Cross-user item update: 403 PASS
- Claims workflow, search filters/sort/pagination, expired/invalid-signature JWT: NOT TESTED

## Final verification
- Claim submission: PASS (id=6)
- Own-item claim: 409 PASS
- Duplicate pending claim: 409 PASS
- Admin claim approval: PASS (APPROVED)
- Category/status filter + sort: PASS
- Pagination: PASS (14 elements, 7 pages)
- Expired/invalid-signature JWT: NOT TESTED
- Unauthorized claim decision: NOT TESTED

## Final security checks
- Expired JWT: 401 PASS
- Invalid signature JWT: 401 PASS
- Unauthorized claim decision: 403 PASS
