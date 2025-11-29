# Pitch2Match API Documentation

## Authentication

### Register
**POST** `/api/register`
- **Body**:
  - `firstname`: string, required
  - `lastname`: string, required
  - `email`: string, required, unique
  - `phone`: string, required
  - `password`: string, required, min 8, confirmed
  - `password_confirmation`: string, required
- **Response**:
  - `message`: "success"
  - `user`: User object

### Login
**POST** `/api/login`
- **Body**:
  - `email`: string, required
  - `password`: string, required
- **Response**:
  - `message`: "success"
  - `token`: string (Sanctum API Token)

### Get User
**GET** `/api/user`
- **Headers**: `Authorization: Bearer <token>`

### Logout
**POST** `/api/logout`
- **Headers**: `Authorization: Bearer <token>`

## Matches

### Scan User
**POST** `/api/matches/scan`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  - `scanned_id`: integer, required (User ID of the person being scanned)
  - `reason`: string, optional

### Accept Match
**POST** `/api/matches/{id}/accept`
- **Headers**: `Authorization: Bearer <token>`
- **Params**:
  - `id`: integer (Match ID)

### Get Match by ID
**GET** `/api/matches/{id}`
- **Headers**: `Authorization: Bearer <token>`
- **Params**:
  - `id`: integer (Match ID)
- **Response**: Match object (reason hidden if user is scanned)

### List Matches
**GET** `/api/matches`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  - `scans`: List of matches where the user is the scanner.
  - `scanned_by`: List of matches where the user was scanned (reason hidden).

## Notifications

### List Notifications
**GET** `/api/notifications`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of notifications for the user

### Mark Notification as Read
**POST** `/api/notifications/{id}/read`
- **Headers**: `Authorization: Bearer <token>`
- **Params**:
  - `id`: integer (Notification ID)
- **Response**: Updated notification object
