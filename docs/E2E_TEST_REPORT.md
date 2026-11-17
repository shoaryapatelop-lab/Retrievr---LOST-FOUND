# E2E Test Report – Retrievr

## Browser E2E
- Playwright/Cypress not configured in project: NOT TESTED via automated browser.
- Manual API-level verification performed (see API_VERIFICATION_REPORT.md).

## Verified via live API
- Registration, login, profile: PASS
- Lost/found creation, image upload, search, filters, sort, pagination: PASS
- Manual matching: PASS
- User/admin dashboards: PASS
- Claims (submit/approve/own/dup): PASS
- Notifications (retrieve/mark-read/unread count): PASS
- Security (invalid/missing JWT 401, normal user admin 403, cross-user 403): PASS
- Expired JWT: 401 PASS
- Invalid signature JWT: 401 PASS
- Unauthorized claim decision: 403 PASS

## Camera
- Desktop/mobile camera: NOT TESTED on device (implementation present in ReportItemForm.tsx)

## Builds
- Frontend production build: PASS
- Backend mvn clean test: 24 tests, 0 failures, BUILD SUCCESS

## Remaining
- Full browser E2E automation not implemented.
- Mobile camera not verified on device.
