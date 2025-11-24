# Lab 03-04: Search Endpoints Test Instructions

## Overview
This document describes how to run the comprehensive test suite for the search endpoints implemented in Lab 03-04.

## Prerequisites

1. **Node.js 18+** (for native fetch support) OR install node-fetch:
   ```bash
   npm install node-fetch
   ```

2. **Server Running**: Make sure your Express server is running:
   ```bash
   npm start
   ```
   The server should be running on `http://localhost:3000` (or set `TEST_URL` environment variable).

3. **Database**: Ensure MongoDB is connected and accessible.

4. **Indexes**: Run the index creation script first:
   ```bash
   npm run create-indexes
   ```

## Running the Tests

### Option 1: Using npm script
```bash
npm run test:search
```

### Option 2: Direct execution
```bash
node test-search-endpoints.js
```

### Option 3: Custom URL
```bash
TEST_URL=http://localhost:3000/api node test-search-endpoints.js
```

## What the Tests Cover

### User Endpoint Tests (GET /api/users)
1. ✅ Basic endpoint access
2. ✅ Keywords search using `$text` operator
3. ✅ Role filtering
4. ✅ maxAge filtering (users created after a date)
5. ✅ minAge filtering (users created before a date)
6. ✅ Sort by givenName (default)
7. ✅ Sort by familyName
8. ✅ Sort by role
9. ✅ Sort by newest (createdOn descending)
10. ✅ Sort by oldest (createdOn ascending)
11. ✅ Default sort verification
12. ✅ Pagination - pageSize
13. ✅ Pagination - pageNumber
14. ✅ Combined filters (keywords + role + sort + pagination)

### Bug Endpoint Tests (GET /api/bugs)
1. ✅ Basic endpoint access
2. ✅ Keywords search using `$text` operator
3. ✅ Classification filtering
4. ✅ maxAge filtering (bugs created after a date)
5. ✅ minAge filtering (bugs created before a date)
6. ✅ Closed filter - show only closed bugs (closed=true)
7. ✅ Closed filter - show only open bugs (closed=false)
8. ✅ Sort by newest (default)
9. ✅ Sort by oldest
10. ✅ Sort by title
11. ✅ Sort by classification
12. ✅ Sort by assignedTo
13. ✅ Sort by createdBy
14. ✅ Default sort verification
15. ✅ Pagination - pageSize
16. ✅ Pagination - pageNumber
17. ✅ Combined filters (keywords + classification + closed + sort + pagination)

## Test Output

The test suite will:
- Create a test user and authenticate
- Create test bugs with various classifications and states
- Run all test cases
- Display results with ✅ for passed tests and ❌ for failed tests
- Show a summary at the end with:
  - Number of tests passed
  - Number of tests failed
  - Total tests
  - Success rate percentage

## Expected Results

All tests should pass if:
- The server is running correctly
- MongoDB indexes are created
- Authentication is working
- All endpoint features are implemented correctly

## Troubleshooting

### "Fetch is not available" error
- Use Node.js 18+ (which has native fetch), or
- Install node-fetch: `npm install node-fetch`

### "Authentication required" errors
- Make sure the server is running
- Check that the test user is being created successfully
- Verify cookie handling is working

### "Index not found" errors
- Run `npm run create-indexes` to create all required indexes

### Tests failing for specific features
- Check the server logs for errors
- Verify the endpoint implementation matches the requirements
- Ensure all query parameters are being handled correctly

## Notes

- The test suite creates test data (users and bugs) during setup
- Test data is created with unique timestamps to avoid conflicts
- The tests verify both individual features and combinations of filters
- All query parameter combinations are tested to ensure they work together

