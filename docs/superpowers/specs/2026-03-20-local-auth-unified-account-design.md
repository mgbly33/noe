# 2026-03-20 Local Auth Unified Account Design

## Status

Approved in chat. Ready for implementation planning after written spec review.

## Scope

This phase replaces the public guest flow with a real username/password account system and unifies user and admin authentication under one session model.

In scope:

- normal user registration
- normal user login
- unified session storage for user and admin roles
- route protection for all business pages
- removal of the public admin entry from the user-facing navigation
- role-gated admin access
- password hashing
- auth-related API and web end-to-end coverage

Out of scope:

- email registration
- SMS registration
- WeChat authorization
- password reset via external channel
- guest-data migration into real accounts

## Problem Statement

The current project still behaves like a demo in the authentication layer:

- user-facing business flows rely on `guest + device_id`
- the top navigation publicly exposes an `Admin` entry
- frontend auth is split into separate guest and admin session paths
- admin credentials are currently stored and verified as plain text

This breaks the product boundary the project now needs. If all meaningful routes are usable without a real account, data isolation is weak at the product level even though the backend already stores most records by `user_id`.

## Goals

1. Require login before any business action.
2. Make all user data isolation hinge on a real `user_id`, not a browser device identifier.
3. Keep one account system for users and admins, with role-based permissions.
4. Remove the public-facing admin entrance while preserving admin capability.
5. Upgrade credential handling from plain-text comparison to hashed-password verification.

## Non-Goals

- no third-party auth provider integration in this phase
- no auto-merge of historical guest data into newly registered users
- no redesign of admin feature content beyond access entry and session handling
- no broad database refactor outside auth requirements

## Product Boundary

### Public pages

The homepage remains publicly accessible, but only as a presentation and entry page.

### Auth-required pages

These routes require an authenticated session:

- `/consent`
- `/question`
- `/products`
- `/checkout`
- `/draw`
- `/reading/[id]`
- `/reading/[id]/followup`
- `/history`
- `/account`

If an unauthenticated user opens one of these pages, the app redirects to `/auth/login` with a `redirect` query parameter.

### Admin pages

`/admin/*` remains a separate route group, but it is no longer exposed through public navigation.

Access rules:

- `role=user`: denied
- `role=admin` or `role=super_admin`: allowed

Normal users may only discover admin access from their authenticated account experience if their role permits it.

## Account Model

The project continues to use `t_user` as the single source of truth.

### Login types

For new registrations in this phase:

- `login_type=local`

Historical values remain in the database for compatibility:

- `guest`
- `local_admin`

No new `guest` users should be created from the web app after this phase ships.

### Roles

Roles are authoritative for authorization:

- `user`
- `admin`
- `super_admin`

`login_type` identifies how a user authenticates. `role` identifies what a user may access. These concerns must remain separate.

## User Journeys

### Registration

Route: `/auth/register`

Fields:

- username
- password
- confirm password

Rules:

- username is required
- username must be unique
- password is required
- confirm password must match password

Behavior:

1. User submits registration form.
2. Backend creates `login_type=local`, `role=user`, `status=active`.
3. Backend returns a signed session token immediately.
4. Frontend stores the unified session.
5. Frontend routes the user to `/consent`.

### Login

Route: `/auth/login`

Fields:

- username
- password

Behavior:

1. User submits credentials.
2. Backend verifies a local or admin account.
3. Backend returns the same session shape for both normal users and admins.
4. Frontend stores the unified session.
5. If a `redirect` parameter exists, the user returns there.
6. Otherwise:
   - admins land in `/account` and may enter admin from there
   - normal users land in `/account`

If the latest consent records are missing, post-login navigation must go to `/consent` before any further business action.

### Logout

Logging out clears:

- unified auth session
- reading-flow cache
- any role-specific client state

This prevents account crossover on shared browsers.

## Frontend Architecture

### Session storage

Replace the split guest/admin session model with one unified session record in `apps/web/src/lib/auth/session.ts`.

Minimum stored fields:

- `token`
- `user_id`
- `role`
- `login_name`

The existing `reading-flow` state remains for business progress only. It must no longer be responsible for identity.

## Navigation

`AppShell` should change as follows:

- remove the public `Admin` link
- when logged out, show login and register entry points
- when logged in, show the account entry point

The user-facing shell should never reveal whether an admin route exists until a user is authenticated.

### Auth routes

New pages:

- `/auth/login`
- `/auth/register`
- `/account`

`/account` responsibilities:

- show current username and role
- expose logout
- show entry to `/history`
- show admin entry only for `admin` and `super_admin`

### Route guards

All business pages should check for the unified session and redirect unauthenticated access to `/auth/login`.

`/admin/*` should:

- redirect unauthenticated users to `/auth/login?redirect=/admin/...`
- redirect authenticated non-admin users away from admin routes

## Backend Architecture

### Endpoints

Add:

- `POST /auth/register`
- `GET /auth/me`

Extend:

- `POST /auth/login`

#### `POST /auth/register`

Request:

```json
{
  "login_type": "local",
  "login_name": "example_user",
  "password": "example_password",
  "channel": "h5"
}
```

Response:

```json
{
  "code": 0,
  "data": {
    "user_id": "usr_xxx",
    "token": "jwt",
    "role": "user",
    "login_name": "example_user",
    "need_consent": true
  }
}
```

#### `POST /auth/login`

Support:

- `login_type=local`
- `login_type=local_admin` for seeded compatibility during transition

Returned payload should match the register response shape.

#### `GET /auth/me`

Reads bearer token and returns:

- `user_id`
- `role`
- `login_name`
- `login_type`
- `need_consent`

This endpoint lets the frontend restore session meaningfully after refresh and handle expired or invalid tokens cleanly.

### Token payload

The access token should keep:

- `user_id`
- `role`
- `channel`

`device_id` should no longer be required for the normal web user flow.

## Password Handling

Current plain-text password comparison must be replaced.

Requirements:

- store password hashes in `password_hash`
- compare submitted passwords against hashes
- hash seeded admin credentials
- never return or log raw passwords

The implementation may use a standard password hashing library already acceptable for the stack, but the design requirement is the behavior, not the specific package.

## Data Isolation

No new data-model strategy is needed for business records because the existing services already query by `user_id` in most places. The critical change is to ensure the authenticated `user_id` always belongs to a real account.

This phase does not migrate historical guest rows.

Expected behavior after launch:

- newly registered user A cannot read user B's history
- user-facing operations always create records under the authenticated `user_id`
- admin-only data remains behind admin role checks

## Seed and Compatibility Strategy

The seed keeps an admin account for local development and verification, but it should be treated as a seeded administrator inside the unified account model, not as a public demo entrance.

Compatibility rules:

- keep historical `local_admin` seed login working for now
- stop creating guest users from the frontend
- allow historical guest data to remain in the database unchanged

## Error Handling

Registration errors:

- duplicate username
- invalid or missing username
- invalid or missing password
- mismatched password confirmation

Login errors:

- wrong username or password
- inactive account
- unsupported login type

Session errors:

- invalid bearer token clears local session and sends the user to login
- 403 on admin route redirects non-admin users away from admin pages

All auth errors should surface explicit messages in the UI instead of generic failure text.

## Testing Strategy

### API

Add or update e2e coverage for:

- successful local registration
- duplicate username rejection
- successful local login
- wrong-password rejection
- `GET /auth/me`
- admin endpoint denied for `role=user`
- two different normal users only seeing their own history

### Web

Add or update Playwright coverage for:

- unauthenticated visit to a business route redirects to `/auth/login`
- registration success routes into consent flow
- public navigation no longer exposes `Admin`
- authenticated admin can access admin from account
- authenticated normal user cannot access `/admin/*`

## Verification Plan

Before implementation is considered complete:

1. Register a normal user from the web UI.
2. Confirm the first successful path goes through consent before business actions.
3. Create business data under one account and verify it appears only in that account's history.
4. Confirm logout clears access to protected routes.
5. Confirm seeded admin can still enter admin routes after unified login handling.
6. Confirm a normal user receives a forbidden result for admin APIs and admin pages.

## Approval Record

Approved in chat:

- only ordinary registration in this phase
- all meaningful functions require login first
- homepage may remain public as a presentation page
- admin entry must not be publicly exposed
- one unified account system with role-based admin permissions
- no guest-flow continuation as a user-facing feature
