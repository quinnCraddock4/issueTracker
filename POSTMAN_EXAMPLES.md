# Postman Examples for Lab 03-04 Search Endpoints

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints require authentication via cookies. First, you need to login to get a session cookie.

---

## Step 1: Authentication

### Register a New User
**POST** `/auth/sign-up/email`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "testuser@example.com",
  "password": "password123",
  "givenName": "John",
  "familyName": "Doe",
  "role": ["Developer", "Quality Analyst"]
}
```

### Login
**POST** `/auth/sign-in/email`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "testuser@example.com",
  "password": "password123"
}
```

**Note:** After login, Postman will automatically save the `sessionId` cookie. Make sure cookies are enabled in Postman settings.

---

## User Endpoint Examples (GET /api/users)

### 1. Get All Users (Default - sorted by givenName)
**GET** `/users`

**Query Parameters:** None

**Example:**
```
GET http://localhost:3000/api/users
```

---

### 2. Search Users by Keywords
**GET** `/users?keywords=John`

**Query Parameters:**
- `keywords`: Search term (searches across user fields)

**Example:**
```
GET http://localhost:3000/api/users?keywords=John
```

---

### 3. Filter Users by Role
**GET** `/users?role=Developer`

**Query Parameters:**
- `role`: Filter by role (e.g., "Developer", "Business Analyst", "Quality Analyst")

**Example:**
```
GET http://localhost:3000/api/users?role=Developer
```

---

### 4. Filter Users by Max Age (created in last 30 days)
**GET** `/users?maxAge=30`

**Query Parameters:**
- `maxAge`: Maximum age in days (users created after this many days ago)

**Example:**
```
GET http://localhost:3000/api/users?maxAge=30
```

---

### 5. Filter Users by Min Age (older than 7 days)
**GET** `/users?minAge=7`

**Query Parameters:**
- `minAge`: Minimum age in days (users created before this many days ago)

**Example:**
```
GET http://localhost:3000/api/users?minAge=7
```

---

### 6. Sort Users by Given Name
**GET** `/users?sortBy=givenName`

**Query Parameters:**
- `sortBy`: `givenName` | `familyName` | `role` | `newest` | `oldest`

**Example:**
```
GET http://localhost:3000/api/users?sortBy=givenName
```

---

### 7. Sort Users by Family Name
**GET** `/users?sortBy=familyName`

**Example:**
```
GET http://localhost:3000/api/users?sortBy=familyName
```

---

### 8. Sort Users by Role
**GET** `/users?sortBy=role`

**Example:**
```
GET http://localhost:3000/api/users?sortBy=role
```

---

### 9. Sort Users by Newest (created date descending)
**GET** `/users?sortBy=newest`

**Example:**
```
GET http://localhost:3000/api/users?sortBy=newest
```

---

### 10. Sort Users by Oldest (created date ascending)
**GET** `/users?sortBy=oldest`

**Example:**
```
GET http://localhost:3000/api/users?sortBy=oldest
```

---

### 11. Pagination - Page Size
**GET** `/users?pageSize=10`

**Query Parameters:**
- `pageSize`: Number of items per page (default: 5)

**Example:**
```
GET http://localhost:3000/api/users?pageSize=10
```

---

### 12. Pagination - Page Number
**GET** `/users?pageSize=5&pageNumber=2`

**Query Parameters:**
- `pageSize`: Number of items per page
- `pageNumber`: Page number (default: 1, first page is 1)

**Example:**
```
GET http://localhost:3000/api/users?pageSize=5&pageNumber=2
```

---

### 13. Combined Filters - Keywords + Role + Sort
**GET** `/users?keywords=John&role=Developer&sortBy=newest&pageSize=10`

**Example:**
```
GET http://localhost:3000/api/users?keywords=John&role=Developer&sortBy=newest&pageSize=10
```

---

### 14. Combined Filters - All Parameters
**GET** `/users?keywords=test&role=Developer&maxAge=365&minAge=0&sortBy=familyName&pageSize=5&pageNumber=1`

**Example:**
```
GET http://localhost:3000/api/users?keywords=test&role=Developer&maxAge=365&minAge=0&sortBy=familyName&pageSize=5&pageNumber=1
```

---

## Bug Endpoint Examples (GET /api/bugs)

### 1. Get All Bugs (Default - sorted by newest)
**GET** `/bugs`

**Query Parameters:** None

**Example:**
```
GET http://localhost:3000/api/bugs
```

---

### 2. Search Bugs by Keywords
**GET** `/bugs?keywords=login`

**Query Parameters:**
- `keywords`: Search term (searches across bug fields)

**Example:**
```
GET http://localhost:3000/api/bugs?keywords=login
```

---

### 3. Filter Bugs by Classification
**GET** `/bugs?classification=bug`

**Query Parameters:**
- `classification`: Filter by classification (`unclassified` | `bug` | `feature` | `enhancement` | `documentation`)

**Example:**
```
GET http://localhost:3000/api/bugs?classification=bug
```

---

### 4. Filter Bugs by Max Age (created in last 30 days)
**GET** `/bugs?maxAge=30`

**Query Parameters:**
- `maxAge`: Maximum age in days (bugs created after this many days ago)

**Example:**
```
GET http://localhost:3000/api/bugs?maxAge=30
```

---

### 5. Filter Bugs by Min Age (older than 7 days)
**GET** `/bugs?minAge=7`

**Query Parameters:**
- `minAge`: Minimum age in days (bugs created before this many days ago)

**Example:**
```
GET http://localhost:3000/api/bugs?minAge=7
```

---

### 6. Filter Closed Bugs Only
**GET** `/bugs?closed=true`

**Query Parameters:**
- `closed`: `true` (closed bugs) | `false` (open bugs) | omit (all bugs)

**Example:**
```
GET http://localhost:3000/api/bugs?closed=true
```

---

### 7. Filter Open Bugs Only
**GET** `/bugs?closed=false`

**Example:**
```
GET http://localhost:3000/api/bugs?closed=false
```

---

### 8. Sort Bugs by Newest (default)
**GET** `/bugs?sortBy=newest`

**Query Parameters:**
- `sortBy`: `newest` | `oldest` | `title` | `classification` | `assignedTo` | `createdBy`

**Example:**
```
GET http://localhost:3000/api/bugs?sortBy=newest
```

---

### 9. Sort Bugs by Oldest
**GET** `/bugs?sortBy=oldest`

**Example:**
```
GET http://localhost:3000/api/bugs?sortBy=oldest
```

---

### 10. Sort Bugs by Title
**GET** `/bugs?sortBy=title`

**Example:**
```
GET http://localhost:3000/api/bugs?sortBy=title
```

---

### 11. Sort Bugs by Classification
**GET** `/bugs?sortBy=classification`

**Example:**
```
GET http://localhost:3000/api/bugs?sortBy=classification
```

---

### 12. Sort Bugs by Assigned To
**GET** `/bugs?sortBy=assignedTo`

**Example:**
```
GET http://localhost:3000/api/bugs?sortBy=assignedTo
```

---

### 13. Sort Bugs by Created By
**GET** `/bugs?sortBy=createdBy`

**Example:**
```
GET http://localhost:3000/api/bugs?sortBy=createdBy
```

---

### 14. Pagination - Page Size
**GET** `/bugs?pageSize=10`

**Query Parameters:**
- `pageSize`: Number of items per page (default: 5)

**Example:**
```
GET http://localhost:3000/api/bugs?pageSize=10
```

---

### 15. Pagination - Page Number
**GET** `/bugs?pageSize=5&pageNumber=2`

**Query Parameters:**
- `pageSize`: Number of items per page
- `pageNumber`: Page number (default: 1, first page is 1)

**Example:**
```
GET http://localhost:3000/api/bugs?pageSize=5&pageNumber=2
```

---

### 16. Combined Filters - Keywords + Classification + Closed
**GET** `/bugs?keywords=bug&classification=bug&closed=false&sortBy=title&pageSize=10`

**Example:**
```
GET http://localhost:3000/api/bugs?keywords=bug&classification=bug&closed=false&sortBy=title&pageSize=10
```

---

### 17. Combined Filters - All Parameters
**GET** `/bugs?keywords=login&classification=bug&maxAge=365&minAge=0&closed=false&sortBy=newest&pageSize=5&pageNumber=1`

**Example:**
```
GET http://localhost:3000/api/bugs?keywords=login&classification=bug&maxAge=365&minAge=0&closed=false&sortBy=newest&pageSize=5&pageNumber=1
```

---

## Postman Collection Setup Tips

1. **Enable Cookies in Postman:**
   - Go to Settings → General
   - Enable "Automatically follow redirects"
   - Cookies should be automatically managed

2. **Create Environment Variables:**
   - `base_url`: `http://localhost:3000/api`
   - Use `{{base_url}}` in your requests

3. **Request Order:**
   - First: Register or Login to get session cookie
   - Then: Use any of the search endpoints

4. **Testing Workflow:**
   ```
   1. POST /auth/sign-in/email (or sign-up)
   2. GET /users (verify authentication works)
   3. Test various search/filter combinations
   4. GET /bugs (test bug endpoints)
   ```

---

## Quick Test Scenarios

### Scenario 1: Find Recent Developer Users
```
GET /users?role=Developer&sortBy=newest&pageSize=10
```

### Scenario 2: Find Open Bugs with "login" keyword
```
GET /bugs?keywords=login&closed=false&sortBy=newest
```

### Scenario 3: Find Bugs Created in Last Week
```
GET /bugs?maxAge=7&sortBy=oldest
```

### Scenario 4: Find All Feature Requests
```
GET /bugs?classification=feature&sortBy=title
```

### Scenario 5: Paginated User Search
```
GET /users?keywords=test&pageSize=5&pageNumber=1
GET /users?keywords=test&pageSize=5&pageNumber=2
```

---

## Response Format

All endpoints return JSON arrays:

**Users Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "givenName": "John",
    "familyName": "Doe",
    "fullName": "John Doe",
    "role": ["Developer"],
    "createdOn": "2024-01-15T10:30:00.000Z"
  }
]
```

**Bugs Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Bug Title",
    "description": "Bug description",
    "classification": "bug",
    "closed": false,
    "createdOn": "2024-01-15T10:30:00.000Z",
    "createdByUserName": "John Doe"
  }
]
```
