# Postman Troubleshooting Guide

## Issue: Getting 404 or 401 Errors

### The Route Requires Authentication!

All `/api/users` and `/api/bugs` endpoints require authentication via cookies. You **must** login first.

---

## Step-by-Step Solution

### Step 1: Login First (REQUIRED)

**Before** testing any user or bug endpoints, you must authenticate:

1. **POST** `http://localhost:3000/api/auth/sign-in/email`
   - **Headers:** `Content-Type: application/json`
   - **Body (JSON):**
     ```json
     {
       "email": "your-email@example.com",
       "password": "your-password"
     }
     ```

2. **OR Register a New User:**
   - **POST** `http://localhost:3000/api/auth/sign-up/email`
   - **Headers:** `Content-Type: application/json`
   - **Body (JSON):**
     ```json
     {
       "email": "newuser@example.com",
       "password": "password123",
       "givenName": "John",
       "familyName": "Doe",
       "role": ["Developer"]
     }
     ```

### Step 2: Enable Cookies in Postman

1. Go to **Settings** (gear icon) → **General**
2. Make sure **"Automatically follow redirects"** is enabled
3. Cookies should be automatically managed by Postman

### Step 3: Verify Cookie is Saved

After login, check:
1. Click on the **Cookies** link below the Send button
2. You should see `sessionId` cookie for `localhost:3000`
3. If not present, the login might have failed

### Step 4: Test the Endpoint

Now try your request again:
- **GET** `http://localhost:3000/api/users?role=Developer`

---

## Common Issues

### Issue 1: 401 Unauthorized
**Cause:** Not logged in or session expired  
**Solution:** Login again using the sign-in endpoint

### Issue 2: 404 Not Found
**Possible Causes:**
- Server not running (check with `lsof -i :3000`)
- Wrong URL path
- Cookie not being sent

**Solution:**
1. Verify server is running: `npm start`
2. Check the exact URL: `http://localhost:3000/api/users?role=Developer`
3. Make sure you logged in first
4. Check that cookies are enabled in Postman

### Issue 3: Cookie Not Being Sent
**Solution:**
1. In Postman, go to the request
2. Click on the **Cookies** link
3. Manually add cookie if needed:
   - Name: `sessionId`
   - Value: (from your login response)
   - Domain: `localhost`

---

## Quick Test Sequence

1. **Test Server is Running:**
   ```
   GET http://localhost:3000/api
   ```
   Should return: `"API is working"`

2. **Login:**
   ```
   POST http://localhost:3000/api/auth/sign-in/email
   Body: { "email": "...", "password": "..." }
   ```
   Should return: `{ "message": "Welcome back!", "userId": "..." }`

3. **Test Protected Route:**
   ```
   GET http://localhost:3000/api/users?role=Developer
   ```
   Should return: Array of users

---

## Using Postman Collection

If you imported the `postman_collection.json`:

1. **Run requests in order:**
   - First: Authentication → Login
   - Then: Users Endpoint → Any request

2. **Use Environment Variables:**
   - Create an environment
   - Set `base_url` = `http://localhost:3000/api`
   - Select the environment in Postman

3. **Check Request Order:**
   - The collection is organized with Authentication first
   - Always run Login before other requests

---

## Verify Server is Running

If you get connection errors:

```bash
# Check if server is running
lsof -i :3000

# Or start the server
cd /home/qcraddock/FinalProject/issueTracker
npm start
```

You should see:
```
server up at http://localhost:3000
```

---

## Expected Responses

### Successful Login:
```json
{
  "message": "Welcome back!",
  "userId": "507f1f77bcf86cd799439011"
}
```

### Successful User List:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "givenName": "John",
    "familyName": "Doe",
    "role": ["Developer"],
    "createdOn": "2024-01-15T10:30:00.000Z"
  }
]
```

### 401 Unauthorized (Not Logged In):
```json
{
  "error": "Authentication required"
}
```

---

## Still Having Issues?

1. **Check server logs** - Look at the terminal where `npm start` is running
2. **Verify MongoDB is running** - The server needs database connection
3. **Check .env file** - Make sure `DB_URL` and `DB_NAME` are set
4. **Try a simple test:**
   ```bash
   curl -v http://localhost:3000/api
   ```

