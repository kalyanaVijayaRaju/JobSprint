# Auth Session Hardening Implementation Plan

## Current Project State

JobSprint already has a working authentication module with registration, login, logout, current-user lookup, and password change support. Login and registration issue a JWT in an HttpOnly cookie named `token`, while protected routes currently authenticate only through an `Authorization: Bearer <token>` header.

The current branch is expected to use a feature-based workflow. This enhancement should be implemented on a dedicated branch:

```text
feature/auth-session-hardening
```

Existing unrelated local changes should not be included in this work:

- `backend/src/models/User.js`
- `backend/src/services/authService.js`
- `.continue/`

## Feature Summary

Harden authenticated session handling by allowing protected routes to authenticate with the existing HttpOnly JWT cookie and by validating JWT subjects against persisted users in MongoDB.

## Reason For Implementation

The API already sets a secure HttpOnly cookie during login and registration, but the authentication middleware only reads bearer tokens. This creates an incomplete browser session flow because clients using cookie-based authentication cannot naturally access protected routes.

The middleware also trusts the JWT payload directly. If a user account is deleted after a token is issued, the token may still be accepted until it expires. Loading the user from the database during authentication improves authorization safety and makes the backend more production-ready.

## Scope

### In Scope

- Support JWT extraction from `Authorization: Bearer <token>`.
- Support JWT extraction from `req.cookies.token`.
- Prefer bearer token when both bearer and cookie tokens are present.
- Verify JWT signatures using the configured secret.
- Load the authenticated user from MongoDB using `decoded.sub`.
- Reject requests when the token is valid but the user no longer exists.
- Preserve existing role-based authorization behavior.
- Add integration tests for bearer, cookie, and stale-token scenarios.

### Out Of Scope

- Refresh tokens.
- Token rotation.
- Session revocation lists.
- Email verification enforcement.
- Password reset flow changes.
- New authentication endpoints.
- User schema changes.

## Files To Modify

### `backend/src/middlewares/authMiddleware.js`

Expected changes:

- Add a reusable token extraction helper.
- Read bearer token first.
- Fall back to `req.cookies.token`.
- Import the `User` model.
- Verify the decoded JWT subject still maps to an existing user.
- Set `req.user` from database-backed user data.

### `backend/test/auth.test.js`

Expected changes:

- Add coverage for cookie-based authentication on `GET /api/v1/auth/me`.
- Update bearer-token tests to use a real persisted user where database lookup is required.
- Add coverage for a token whose user no longer exists.
- Keep existing register, login, logout, and password-change tests passing.

## API Changes

No new endpoints are required.

Existing protected endpoints gain cookie-session support:

- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `PATCH /api/v1/auth/password`
- Any other route using the shared `protect` middleware

## Database Changes

No database schema change is required.

The middleware will add one user lookup per authenticated request:

```text
User.findById(decoded.sub)
```

The lookup should select only default user fields and must not expose `passwordHash`.

## Architectural Notes

The auth middleware should remain the single source of truth for request authentication. Controllers and services should continue to trust `req.user` after `protect` succeeds.

The role authorization middleware should not change. It should continue reading `req.user.role`.

The behavior should remain backward-compatible for API clients already using bearer tokens.

## Implementation Tasks

1. Create the feature branch:

   ```text
   git switch -c feature/auth-session-hardening
   ```

2. Refactor token extraction in `authMiddleware.js`:

   - Extract bearer token from `Authorization`.
   - Extract cookie token from `req.cookies.token`.
   - Return bearer token first, then cookie token.

3. Add database-backed user validation:

   - Verify the JWT.
   - Fetch `User.findById(decoded.sub)`.
   - Reject missing users with `401`.
   - Set `req.user` using persisted user fields.

4. Add or update auth integration tests:

   - Bearer token still works.
   - Cookie token works.
   - Missing token returns `401`.
   - Valid token for nonexistent user returns `401`.

5. Run verification:

   ```text
   npm run check
   node --test test/auth.test.js
   ```

## Commit Plan

This work can be completed as one focused commit:

```text
feat: harden authenticated session handling
```

If implementation grows larger than expected, split into two commits:

```text
feat: support cookie tokens in auth middleware
test: cover database-backed auth sessions
```

Each commit message must be presented for approval before committing.

## Acceptance Criteria

- Protected routes accept valid bearer tokens.
- Protected routes accept valid HttpOnly cookie tokens.
- Bearer token takes precedence when both bearer and cookie tokens exist.
- Valid JWTs for nonexistent users are rejected.
- `req.user` contains `id`, `email`, and `role` from the persisted user record.
- Existing auth tests continue to pass.
- No unrelated local files are included in commits.
